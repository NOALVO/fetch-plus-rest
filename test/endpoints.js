module.exports = {
  happn: {
    $url: 'https://fn-api-happn.azurewebsites.net',
    $options: {
      auth: {
        scheme: 'Basic|Bearer',
        value: 'base64credentials|accessToken',
        storage: 'local|session|cookie',
        storageKeyToken: 'accessToken',
        storageKeyUser: 'user',
        storageKeyPassword: 'password',
      }
    },
    markers: {
      $url: '/markers',
      bonitos: '/bonitos',
      buscaAvancada: {
        $url: '/busca',
        filtro1: '/filtro1'
      }
    }
  }
}