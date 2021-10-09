import { RepositoryBase } from '@valluri/saradhi-library';
import { Connection, getConnection } from 'typeorm';

test('should connect to DB', async () => {
	console.log(`Connecting to DB at ${process.env.TYPEORM_HOST}:${process.env.TYPEORM_PORT}`);
	const connection = await RepositoryBase.getConnection();
	expect(connection).toBeInstanceOf(Connection);
	expect(getConnection().isConnected).toBe(true);
	await RepositoryBase.closeConnection();
	expect(null);
});
