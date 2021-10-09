import { Service } from 'moleculer-decorators';
import { ServiceBase } from '@valluri/saradhi-library';

@Service({
	name: 'loanRequestMatcher',
	version: 1,
})
export default class LoanRequestMatcherService extends ServiceBase {}

module.exports = LoanRequestMatcherService;
