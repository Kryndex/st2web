import { expect } from 'chai';

import '@stackstorm/module-test-utils/bootstrap/st2constants';
import '@stackstorm/module-test-utils/bootstrap/storage';
import '@stackstorm/module-test-utils/bootstrap/location';
import api from '..';

import moxios from 'moxios';

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection:', reason); // eslint-disable-line no-console
});

describe('API', () => {
  describe('connect', () => {
    before(() => moxios.install());
    after(() => moxios.uninstall());

    it('authenticates', () => {
      moxios.stubRequest('https://example.com:443/auth/tokens', {
        status: 201,
        response: {
          user: 'st2admin',
          token: 'foo',
          expiry: '2100-01-01T00:00:00.000Z',
        },
      });

      return api.connect({ auth: true }, 'username', 'password');
    });

    it('has a client', () => {
      expect(api.client).to.exist;
    });

    it('is connected', () => {
      expect(api.isConnected()).to.equal(true);
    });
  });

  describe('disconnect', () => {
    before(() => api.disconnect());

    it('doesn\'t have a client', () => {
      expect(api.client).to.not.exist;
    });

    it('is not connected', () => {
      expect(api.isConnected()).to.equal(false);
    });
  });
});
