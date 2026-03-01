const backendOriginRaw = process.env.BACKEND_ORIGIN || 'https://osk-kamenna-poruba-back.vercel.app';
const BACKEND_ORIGIN = String(backendOriginRaw).replace(/\/+$/, '');

function buildTargetUrl(req) {
  const originalUrl = String(req.url || '/');
  const url = new URL(originalUrl, 'http://localhost');
  const targetPath = url.pathname.startsWith('/api') ? url.pathname : `/api${url.pathname}`;
  return `${BACKEND_ORIGIN}${targetPath}${url.search}`;
}

function filteredRequestHeaders(headers) {
  const nextHeaders = { ...headers };
  delete nextHeaders.host;
  delete nextHeaders['content-length'];
  delete nextHeaders['x-forwarded-host'];
  delete nextHeaders['x-forwarded-port'];
  delete nextHeaders['x-forwarded-proto'];
  return nextHeaders;
}

module.exports = async (req, res) => {
  try {
    const targetUrl = buildTargetUrl(req);
    const method = String(req.method || 'GET').toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);

    const upstreamResponse = await fetch(targetUrl, {
      method,
      headers: filteredRequestHeaders(req.headers || {}),
      body: hasBody ? req : undefined,
      redirect: 'manual'
    });

    const responseHeaders = {};
    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders['content-type'] = contentType;
    }

    const setCookie = upstreamResponse.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders['set-cookie'] = setCookie;
    }

    Object.entries(responseHeaders).forEach(([key, value]) => {
      if (value) {
        res.setHeader(key, value);
      }
    });

    const bodyText = await upstreamResponse.text();
    return res.status(upstreamResponse.status).send(bodyText);
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(502).json({ message: 'Backend proxy error' });
  }
};
