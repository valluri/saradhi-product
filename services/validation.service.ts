import { Context } from 'moleculer';
import { ErrorHelper } from '@valluri/saradhi-library';
import { ServiceBase, Messages, Constants } from '@valluri/saradhi-library';
import { Method, Action, Service } from 'moleculer-decorators';

@Service({
	name: 'productValidation',
	version: 1,
})
export default class ValidationService extends ServiceBase {}

module.exports = ValidationService;
