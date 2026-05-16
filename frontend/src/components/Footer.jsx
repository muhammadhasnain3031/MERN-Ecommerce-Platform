import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)',
      color:'#fff', padding:'48px 0 24px',
    }}>
      <div className="container">
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
          gap:32, marginBottom:40,
        }}>

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{
                width:40, height:40, borderRadius:12,
                background:'linear-gradient(135deg,#f59e0b,#f97316)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:900, fontSize:20, color:'#fff',
              }}>S</div>
              <div>
                <span style={{ fontWeight:900, fontSize:18 }}>Sultan</span>
                <span style={{ color:'#fbbf24', fontWeight:900, fontSize:18 }}> Elite</span>
              </div>
            </div>
            <p style={{ color:'rgba(255,255,255,.55)', fontSize:13, lineHeight:1.8, marginBottom:16 }}>
              Pakistan's premium online shopping destination. Quality products, fast delivery, best prices.
            </p>
            <div style={{ display:'flex', gap:8 }}>
              {['📘','📸','🐦','▶️'].map((icon,i) => (
                <div key={i} style={{
                  width:34, height:34, borderRadius:8,
                  background:'rgba(255,255,255,.08)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', fontSize:16,
                  border:'1px solid rgba(255,255,255,.1)',
                }}>{icon}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:700, color:'#fbbf24', marginBottom:16, textTransform:'uppercase', letterSpacing:.8 }}>
              Quick Links
            </h4>
            {[
              ['/',        'Home'        ],
              ['/shop',    'Shop'        ],
              ['/cart',    'My Cart'     ],
              ['/orders',  'My Orders'   ],
              ['/register','Create Account'],
            ].map(([to,label]) => (
              <Link key={to} to={to} style={{
                display:'block', color:'rgba(255,255,255,.6)',
                fontSize:13, marginBottom:10, transition:'color .2s',
              }}
                onMouseEnter={e => e.target.style.color='#fbbf24'}
                onMouseLeave={e => e.target.style.color='rgba(255,255,255,.6)'}>
                → {label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:700, color:'#fbbf24', marginBottom:16, textTransform:'uppercase', letterSpacing:.8 }}>
              Categories
            </h4>
            {['Electronics','Clothing','Books','Home','Sports','Beauty'].map(cat => (
              <Link key={cat} to={`/shop?category=${cat}`} style={{
                display:'block', color:'rgba(255,255,255,.6)',
                fontSize:13, marginBottom:10, transition:'color .2s',
              }}
                onMouseEnter={e => e.target.style.color='#fbbf24'}
                onMouseLeave={e => e.target.style.color='rgba(255,255,255,.6)'}>
                → {cat}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize:13, fontWeight:700, color:'#fbbf24', marginBottom:16, textTransform:'uppercase', letterSpacing:.8 }}>
              Contact Us
            </h4>
            {[
              ['📍','Sargodha, Punjab, Pakistan'],
              ['📱','0300-XXXXXXX'],
              ['📧','info@sultanelite.pk'],
              ['⏰','Mon-Sat: 9AM - 9PM'],
            ].map(([icon,text]) => (
              <p key={text} style={{
                display:'flex', gap:8, alignItems:'flex-start',
                color:'rgba(255,255,255,.6)', fontSize:13, marginBottom:10, lineHeight:1.5,
              }}>
                <span style={{ flexShrink:0 }}>{icon}</span>{text}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop:'1px solid rgba(255,255,255,.1)',
          paddingTop:20,
          display:'flex', flexWrap:'wrap', gap:12,
          justifyContent:'space-between', alignItems:'center',
        }}>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>
            © 2026 Sultan Elite Shop — All rights reserved
          </p>
          <div style={{ display:'flex', gap:16 }}>
            {['Privacy Policy','Terms of Use','Refund Policy'].map(t => (
              <span key={t} style={{ color:'rgba(255,255,255,.4)', fontSize:12, cursor:'pointer' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}