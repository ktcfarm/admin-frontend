export class BaseHttpClient {
  constructor() {
    if (new.target === BaseHttpClient) {
      throw new Error('BaseHttpClient is an abstract class and cannot be instantiated directly.');
    }
  }

  get(_url, _config) {
    throw new Error('Method get() must be implemented.');
  }

  post(_url, _data, _config) {
    throw new Error('Method post() must be implemented.');
  }

  put(_url, _data, _config) {
    throw new Error('Method put() must be implemented.');
  }

  patch(_url, _data, _config) {
    throw new Error('Method patch() must be implemented.');
  }

  delete(_url, _config) {
    throw new Error('Method delete() must be implemented.');
  }
}

export default BaseHttpClient;
