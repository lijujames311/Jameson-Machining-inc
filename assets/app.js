// tiny inlined SVG placeholder so we don't need a binary file
const PH = 'data:image/svg+xml;utf8,'
 + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'
 + '<rect width="600" height="600" fill="#eee"/><text x="50" y="320" font-size="32" fill="#333">Product Image</text></svg>');

async function loadProducts(){
  try{
    const res = await fetch('/products/products.json',{cache:'no-store'});
    if(!res.ok) throw new Error('products.json missing');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }catch(e){ console.warn('No products yet', e); return []; }
}

function cardTemplate(p){
  const img = (p.images && p.images[0]) ? p.images[0] : PH;
  const specs = [p.module ? `Module ${p.module}`:'', p.pressure_angle ? `${p.pressure_angle}° PA`:'', p.od_mm ? `${p.od_mm}mm OD`:''].filter(Boolean).join(' • ');
  const href = p.slug ? `/products/${p.slug}.html` : `/contact.html?product=${encodeURIComponent(p.title)}`;
  return `<a class="product-card" href="${href}">
    <img src="${img}" alt="${p.title}"><div class="p-body">
    <div class="p-title">${p.title}</div>
    <div class="p-specs">${specs}</div>
    <div>${p.brand||''} ${p.category?`<span class="badge">${p.category}</span>`:''}</div>
  </div></a>`;
}

async function mountFeatured(){
  const grid = document.getElementById('featured-grid'); if(!grid) return;
  const items = (await loadProducts()).slice(0,6).map(cardTemplate).join('');
  grid.innerHTML = items || '<p>Add items to <code>products/products.json</code> to feature them here.</p>';
}

async function mountCatalog(){
  const grid = document.getElementById('catalogGrid'); if(!grid) return;
  const products = await loadProducts();
  const url = new URL(location.href);
  const initialQ = (url.searchParams.get('q')||'').toLowerCase();
  const initialCat = url.searchParams.get('category')||'';
  const q = document.getElementById('searchInput'); const cat = document.getElementById('categoryFilter'); const brand = document.getElementById('brandFilter');
  if(initialQ) q.value = initialQ; if(initialCat) cat.value = initialCat;

  const render = ()=>{
    const t = (q.value||'').toLowerCase(), c = cat.value||'', b = brand.value||'';
    const out = products.filter(p=>{
      const inC = c? p.category===c : true;
      const inB = b? p.brand===b : true;
      const text = (p.title+' '+(p.description||'')+' '+(p.module||'')+' '+(p.brand||'')).toLowerCase();
      return inC && inB && (t? text.includes(t):true);
    }).map(cardTemplate).join('');
    grid.innerHTML = out || '<p>No products found.</p>';
  };
  q.addEventListener('input',render); cat.addEventListener('change',render); brand.addEventListener('change',render); render();
}

function prefillContact(){
  const f = document.getElementById('productField'); if(!f) return;
  const p = new URL(location.href).searchParams.get('product'); if(p) f.value=p;
}

document.addEventListener('DOMContentLoaded', ()=>{ mountFeatured(); mountCatalog(); prefillContact(); });
