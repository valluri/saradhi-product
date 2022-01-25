'use strict';
import { BrokerOptions } from 'moleculer';
import 'reflect-metadata';
import * as Moleculer from 'moleculer';
import MoleculerRetryableError = Moleculer.Errors.MoleculerRetryableError;
const SaradhiTracer = require('@valluri/saradhi-library/dist/src/service-helpers/service-trace-helper');

/**
 * Moleculer ServiceBroker configuration file
 *
 * More info about options: https://moleculer.services/docs/0.14/broker.html#Broker-options
 *
 * Overwrite options in production:
 * ================================
 * 	You can overwrite any option with environment variables.
 * 	For example to overwrite the "logLevel", use `LOGGER=warn` env var.
 * 	To overwrite a nested parameter, e.g. retryPolicy.retries, use `RETRYPOLICY_RETRIES=10` env var.
 *
 * 	To overwrite broker’s deeply nested default options, which are not presented in "moleculer.config.ts",
 * 	via environment variables, use the `MOL_` prefix and double underscore `__` for nested properties in .env file.
 * 	For example, to set the cacher prefix to `MYCACHE`, you should declare an env var as `MOL_CACHER__OPTIONS__PREFIX=MYCACHE`.
 */
const brokerConfig: BrokerOptions = {
	// Namespace of nodes to segment your nodes on the same network.
	namespace: 'saradhi',
	// Unique node identifier. Must be unique in a namespace.
	nodeID: undefined,

	metadata: {
		type: 'product',
	},

	cacher: 'redis://192.168.99.100:6379',

	// Enable/disable logging or use custom logger. More info: https://moleculer.services/docs/0.14/logging.html
	// Available logger types: "Console", "File", "Pino", "Winston", "Bunyan", "debug", "Log4js", "Datadog"
	logger: {
		type: 'Console',
		options: {
			// Using colors on the output
			colors: true,
			// Print module names with different colors (like docker-compose for containers)
			moduleColors: false,
			// Line formatter. It can be "json", "short", "simple", "full", a `Function` or a template string like "{timestamp} {level} {nodeID}/{mod}: {msg}"
			formatter: 'full',
			// Custom object printer. If not defined, it uses the `util.inspect` method.
			objectPrinter: null,
			// Auto-padding the module name in order to messages begin at the same column.
			autoPadding: false,
		},
	},

	// Log level for built-in console logger. Available values: trace, debug, info, warn, error, fatal
	logLevel: 'info',

	// Define transporter.
	// More info: https://moleculer.services/docs/0.14/networking.html
	transporter: 'redis://192.168.99.100:6379',

	// Define a serializer.
	// Available values: "JSON", "Avro", "ProtoBuf", "MsgPack", "Notepack", "Thrift".
	// More info: https://moleculer.services/docs/0.14/networking.html
	serializer: 'JSON',

	// Number of milliseconds to wait before reject a request with a RequestTimeout error. Disabled: 0
	requestTimeout: 30 * 1000,

	tracing: {
		enabled: true,
		exporter: [new SaradhiTracer()],
		// exporter: {
		// 	type: 'Jaeger',
		// 	options: {
		// 		// HTTP Reporter endpoint. If set, HTTP Reporter will be used.
		// 		endpoint: null,

		// 		// UDP Sender host option.
		// 		host: '127.0.0.1',
		// 		// UDP Sender port option.
		// 		port: 6832,
		// 		// Jaeger Sampler configuration.
		// 		sampler: {
		// 			// Sampler type. More info: https://www.jaegertracing.io/docs/1.14/sampling/#client-sampling-configuration
		// 			type: 'Const',
		// 			// Sampler specific options.
		// 			options: {},
		// 		},
		// 		// Additional options for `Jaeger.Tracer`
		// 		tracerOptions: {},
		// 		// Default tags. They will be added into all span tags.
		// 		defaultTags: null,
		// 	},
		// },
	},

	// Retry policy settings. More info: https://moleculer.services/docs/0.14/fault-tolerance.html#Retry
	retryPolicy: {
		// Enable feature
		enabled: false,
		// Count of retries
		retries: 5,
		// First delay in milliseconds.
		delay: 100,
		// Maximum delay in milliseconds.
		maxDelay: 1000,
		// Backoff factor for delay. 2 means exponential backoff.
		factor: 2,
		// A function to check failed requests.
		check: (err: Error) => err && err instanceof MoleculerRetryableError && !!err.retryable,
	},

	// Limit of calling level. If it reaches the limit, broker will throw an MaxCallLevelError error. (Infinite loop protection)
	maxCallLevel: 100,

	// Number of seconds to send heartbeat packet to other nodes.
	heartbeatInterval: 5,
	// Number of seconds to wait before setting node to unavailable status.
	heartbeatTimeout: 15,

	// Tracking requests and waiting for running requests before shutdowning. More info: https://moleculer.services/docs/0.14/fault-tolerance.html
	tracking: {
		// Enable feature
		enabled: false,
		// Number of milliseconds to wait before shutdowning the process
		shutdownTimeout: 15000,
	},

	// Disable built-in request & emit balancer. (Transporter must support it, as well.)
	disableBalancer: false,

	// Settings of Service Registry. More info: https://moleculer.services/docs/0.14/registry.html
	registry: {
		// Define balancing strategy.
		// Available values: "RoundRobin", "Random", "CpuUsage", "Latency"
		strategy: 'RoundRobin',
		// Enable local action call preferring.
		preferLocal: true,
	},

	// Settings of Circuit Breaker. More info: https://moleculer.services/docs/0.14/fault-tolerance.html#Circuit-Breaker
	circuitBreaker: {
		// Enable feature
		enabled: false,
		// Threshold value. 0.5 means that 50% should be failed for tripping.
		threshold: 0.5,
		// Minimum request count. Below it, CB does not trip.
		minRequestCount: 20,
		// Number of seconds for time window.
		windowTime: 60,
		// Number of milliseconds to switch from open to half-open state
		halfOpenTime: 10 * 1000,
		// A function to check failed requests.
		check: (err: Error) => err && err instanceof MoleculerRetryableError && err.code >= 500,
	},

	// Settings of bulkhead feature. More info: https://moleculer.services/docs/0.14/fault-tolerance.html#Bulkhead
	bulkhead: {
		// Enable feature.
		enabled: false,
		// Maximum concurrent executions.
		concurrency: 10,
		// Maximum size of queue
		maxQueueSize: 100,
	},

	// Enable parameters validation. More info: https://moleculer.services/docs/0.13/validating.html
	validator: true,

	// Enable metrics function. More info: https://moleculer.services/docs/0.14/metrics.html
	metrics: {
		enabled: true,
	},

	// Register internal services ("$node"). More info: https://moleculer.services/docs/0.14/services.html#Internal-services
	internalServices: true,
	// Register internal middlewares. More info: https://moleculer.services/docs/0.14/middlewares.html#Internal-middlewares
	internalMiddlewares: true,

	// Watch the loaded services and hot reload if they changed. You can also enable it in Moleculer Runner with `--hot` argument
	hotReload: false,

	// Register custom middlewares
	middlewares: [],

	// Called after broker created.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	created(broker) {},

	// Called after broker starte.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	started(broker) {},

	// Called after broker stopped.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	stopped(broker) {},

	// Register custom REPL commands.
	replCommands: undefined,
};

export = brokerConfig;
