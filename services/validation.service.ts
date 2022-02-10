import { ServiceBase } from '@valluri/saradhi-library';
import { Service } from 'moleculer-decorators';

@Service({
	name: 'productValidation',
	version: 1,
})
export default class ValidationService extends ServiceBase {}

module.exports = ValidationService;
