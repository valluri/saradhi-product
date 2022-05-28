import { RepositoryBase } from '@valluri/saradhi-library';
import { DataSource } from 'typeorm';

test('should connect to DB', async () => {
	console.log(`Connecting to DB at ${process.env.TYPEORM_HOST}:${process.env.TYPEORM_PORT}`);
	const dataSource = await RepositoryBase.getDataSource();
	expect(dataSource).toBeInstanceOf(DataSource);
	expect(dataSource.isInitialized).toBe(true);
	await RepositoryBase.closeDataSource();
	expect(null);
});
