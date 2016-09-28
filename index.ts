'use strict';

const readline = require('readline');
const csp = require('js-csp');
import _ = require('lodash');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

// think rest call
function asyncCall(line: string): Promise<string> {
  return new Promise((resolve: (str: string) => void, reject) => {
    setTimeout(() => {
      const upper = _.toUpper(line);
      resolve(upper);
    }, _.random(100, 500))
  });
}

function* worker(number: number, work, results) {
  while (true) {
    const line = yield csp.take(work);
    // console.log(number + ' took a job');

    const asyncChan = csp.chan();
    asyncCall(line)
    .then(upper => csp.putAsync(asyncChan, upper))
    .catch(err => asyncChan.close());

    const result = yield csp.take(asyncChan);
    if (result == csp.CLOSED) {
      // console.log(number + ' has error');
      continue;
    }
    // console.log(number + ' got a result');
    yield csp.put(results, result);
  }
}

csp.go(function* () {
  const work = csp.chan();
  const results = csp.chan();

  _.map(_.times(5), number => csp.go(worker, [number, work, results]));

  rl.on('line', line => csp.putAsync(work, line));

  while (true) {
    const result = yield csp.take(results);
    if (result === csp.CLOSED) {
      return;
    }
    console.log(result);
  }
});
