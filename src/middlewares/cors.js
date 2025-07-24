// ===== middleware/cors.js =====
const corsMiddleware = (req, res, next) => {
    // Debug complet
    // console.log('🔍 CORS Request:', {
    //   method: req.method,
    //   origin: req.headers.origin,
    //   url: req.url,
    //   userAgent: req.headers['user-agent']?.substring(0, 50)
    // });
  
    // Headers CORS pour Chrome (le plus permissif possible)
    const origin = req.headers.origin;
    
    // Permettre toutes les origines localhost/192.168 en développement
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('192.168') ||
        origin.includes('10.0.') ||
        origin.startsWith('exp://')) {
      
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  
    // Headers essentiels pour Chrome
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', [
      'Accept',
      'Accept-Language', 
      'Content-Language',
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'DNT',
      'User-Agent',
      'Keep-Alive',
      'X-CustomHeader'
    ].join(', '));
    
    res.setHeader('Access-Control-Expose-Headers', 'Authorization, Content-Length');
    res.setHeader('Access-Control-Max-Age', '1728000'); // 20 jours
    
    // Réponse immédiate pour OPTIONS
    if (req.method === 'OPTIONS') {
      console.log('✅ Preflight OPTIONS handled');
      res.status(204).send('');
      return;
    }
  
    console.log('✅ CORS headers set, continuing...');
    next();
  };
  
  module.exports = corsMiddleware;