import { log } from '../utils';

class HotChildProcessServer {
  constructor(name, compiler) {
    compiler.plugin('compile', () => {
      this.serverCompiling = true;
      log({
        title: name,
        level: 'info',
        message: 'Building new bundle...',
      });
    });

    compiler.plugin('done', (stats) => {
      this.serverCompiling = false;

      if (this.disposing) {
        return;
      }

      try {
        if (stats.hasErrors()) {
          log({
            title: name,
            level: 'error',
            message: 'Build failed, check the console for more information.',
            notify: true,
          });
          console.log(stats.toString());
          return;
        }
      } catch (err) {
        log({
          title: name,
          level: 'error',
          message: 'Failed to start, please check the console for more information.',
          notify: true,
        });
        console.error(err);
      }
    });

    // Lets start the compiler.
    this.watcher = compiler.watch(null, () => undefined);
  }

  dispose() {
    this.disposing = true;

    const stopWatcher = new Promise((resolve) => {
      this.watcher.close(resolve);
    });

    return Promise.resolve();
  }
}

export default HotChildProcessServer;
