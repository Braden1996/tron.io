import { resolve as pathResolve } from 'path';
import webpack from 'webpack';
import appRootDir from 'app-root-dir';
import { log } from '../utils';
import HotNodeServer from './hotNodeServer';
import HotChildProcessServer from './hotChildProcessServer';
import HotClientServer from './hotClientServer';
import createVendorDLL from './createVendorDLL';
import webpackConfigFactory from '../webpack/configFactory';
import config from '../../config';

const usesDevVendorDLL = bundleConfig =>
  bundleConfig.devVendorDLL != null && bundleConfig.devVendorDLL.enabled;

const vendorDLLsFailed = (err) => {
  log({
    title: 'vendorDLL',
    level: 'error',
    message: 'Unfortunately an error occured whilst trying to build the vendor dll(s) used by the development server. Please check the console for more information.',
    notify: true,
  });
  if (err) {
    console.error(err);
  }
};

const initializeBundle = (name, bundleConfig) => {
  const createCompiler = () => {
    try {
      const webpackConfig = webpackConfigFactory({
        target: name,
        mode: 'development',
      });
      // Install the vendor DLL config for the client bundle if required.
      if (name === 'client' && usesDevVendorDLL(bundleConfig)) {
        // Install the vendor DLL plugin.
        webpackConfig.plugins.push(
          new webpack.DllReferencePlugin({
            // $FlowFixMe
            manifest: require(
              pathResolve(
                appRootDir.get(),
                bundleConfig.outputPath,
                `${bundleConfig.devVendorDLL.name}.json`,
              ),
            ),
          }),
        );
      }
      return webpack(webpackConfig);
    } catch (err) {
      log({
        title: 'development',
        level: 'error',
        message: 'Webpack config is invalid, please check the console for more information.',
        notify: true,
      });
      console.error(err);
      throw err;
    }
  };

  return { name, bundleConfig, createCompiler };
};

class HotDevelopment {
  constructor() {
    this.hotClientServer = null;
    this.hotNodeServers = [];
    this.hotChildProcessServers = [];

    const clientBundle = initializeBundle('client', config('bundles.client'));

    const nodeBundles = [initializeBundle('server', config('bundles.server'))]
      .concat(Object.keys(config('additionalNodeBundles'))
        .filter(name => config('additionalNodeBundles')[name].isNodeSever)
        .map(name =>
          initializeBundle(name, config('additionalNodeBundles')[name]),
        )
      );

    const childProcessBundles = Object.keys(config('additionalNodeBundles'))
      .filter(name => !config('additionalNodeBundles')[name].isNodeSever)
      .map(name =>
        initializeBundle(name, config('additionalNodeBundles')[name]),
      );

    Promise
      // First ensure the client dev vendor DLLs is created if needed.
      .resolve(
        usesDevVendorDLL(config('bundles.client'))
          ? createVendorDLL('client', config('bundles.client'))
          : true,
      )
      // Then start the client development server.
      .then(
        () => new Promise((resolve) => {
          const { createCompiler } = clientBundle;
          const compiler = createCompiler();
          compiler.plugin('done', (stats) => {
            if (!stats.hasErrors()) {
              resolve(compiler);
            }
          });
          this.hotClientServer = new HotClientServer(compiler);
        }),
        vendorDLLsFailed,
      )
      .then((clientCompiler) => {
        // Then start the child process development server(s).
        this.hotChildProcessServers = childProcessBundles
          .map(({ name, createCompiler }) =>
            new HotChildProcessServer(name, createCompiler()),
          );

        // Then start the node development server(s).
        this.hotNodeServers = nodeBundles
          .map(({ name, createCompiler }) =>
            // $FlowFixMe
            new HotNodeServer(name, createCompiler(), clientCompiler),
          );
      });
  }

  dispose() {
    const safeDisposer = server => (
      server
        ? server.dispose()
        : Promise.resolve()
    );

    // First the hot client server.
    return safeDisposer(this.hotClientServer)
      // Then dispose the hot node server(s).
      .then(() => Promise.all(this.hotNodeServers.map(safeDisposer)))
      // Then dispose the hot child process server(s).
      .then(() => Promise.all(this.hotChildProcessServers.map(safeDisposer)));
  }
}

export default HotDevelopment;
