const tracer = require('dd-trace');

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
});

module.exports = tracer;
