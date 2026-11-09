(function(){
  var body=document.body;
  if('scrollRestoration' in history) history.scrollRestoration='manual';

  // Fassungen je Abschnitt: Leiste unten, Pfeiltasten wechseln, 0 ist der bisherige Stand
  var aktivFass=null;
  document.querySelectorAll('[data-fassungen]').forEach(function(h){
    var fs=[].slice.call(h.children).filter(function(f){ return f.classList.contains('fassung'); });
    var nr=Number(h.dataset.start||0);
    var bar=document.createElement('div'); bar.className='fassbar';
    bar.innerHTML='<button type="button" aria-label="Vorherige Fassung">‹</button><span></span><button type="button" aria-label="Nächste Fassung">›</button>';
    document.body.appendChild(bar);
    var name=bar.querySelector('span');
    function zeige(n,neu){
      nr=(n+fs.length)%fs.length;
      fs.forEach(function(f,i){ f.classList.toggle('an',i===nr); });
      name.textContent=nr+' · '+fs[nr].dataset.name;
      if(neu){
        var els=fs[nr].querySelectorAll('.flieg,.schlitz,.zoom');
        [].forEach.call(els,function(e){ e.classList.remove('da'); });
        void fs[nr].offsetWidth;
        requestAnimationFrame(function(){ requestAnimationFrame(function(){ [].forEach.call(els,function(e){ e.classList.add('da'); }); }); });
      }
    }
    h.weiter=function(d){ zeige(nr+d,true); };
    bar.firstChild.addEventListener('click',function(){ h.weiter(-1); });
    bar.lastChild.addEventListener('click',function(){ h.weiter(1); });
    zeige(nr,false);
    new IntersectionObserver(function(es){
      var an=es[0].isIntersecting; bar.classList.toggle('sichtbar',an);
      if(an)aktivFass=h; else if(aktivFass===h)aktivFass=null;
    },{rootMargin:'-45% 0px -45% 0px'}).observe(h);
  });

  // Erster Blick komplett: zeigen, sobald die Bilder im ersten Bild und die Schrift da sind
  function geladen(b){ return new Promise(function(r){ if(!b||b.complete)r(); else {b.addEventListener('load',r);b.addEventListener('error',r);} }); }
  var warten=[document.fonts?document.fonts.ready:Promise.resolve()];
  document.querySelectorAll('.an img[data-erst], img[data-erst]:not(.fassung img)').forEach(function(b){ warten.push(geladen(b)); });
  var sprung=location.hash?document.querySelector(location.hash):null;
  if(sprung) sprung.querySelectorAll('img').forEach(function(b){ warten.push(geladen(b)); });
  function zeigen(){
    if(!body.classList.contains('wartet'))return;
    scrollTo(0, sprung ? sprung.getBoundingClientRect().top+scrollY : 0);
    body.classList.remove('wartet'); start();
  }
  Promise.all(warten).then(zeigen);
  setTimeout(zeigen,3000);

  function start(){
    // Auftakt geht von selbst auf
    document.querySelectorAll('#oben .flieg,#oben .schlitz,#oben .zoom').forEach(function(el){ el.classList.add('da'); });

    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting)return; var el=e.target; el.classList.add('unterwegs'); el.classList.add('da'); io.unobserve(el); setTimeout(function(){ el.classList.remove('unterwegs'); },1500); });
    },{rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.flieg,.schlitz,.zoom').forEach(function(el){ if(!el.classList.contains('da'))io.observe(el); });

    // Staffel: Kacheln einer Reihe kommen kurz nacheinander, danach läuft einmal der Glanzstreif
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(!e.isIntersecting)return; so.unobserve(e.target);
        [].forEach.call(e.target.children,function(k,i){ setTimeout(function(){ k.classList.add('da'); setTimeout(function(){ k.classList.add('glanz'); },900); },i*110); });
      });
    },{rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.staffel').forEach(function(g){ so.observe(g); });

    // Bilder früh laden, damit beim Scrollen nichts nachlädt
    var spaeter=window.requestIdleCallback||function(f){ return setTimeout(f,400); };
    spaeter(function(){ document.querySelectorAll('img[loading="lazy"]').forEach(function(b){ if(!b.closest('.fassung:not(.an)')){ b.decoding='async'; b.loading='eager'; } });
      // nacheinander entpacken, damit beim Hineinscrollen nichts mehr gerechnet werden muss
      var liste=[].filter.call(document.images,function(b){ return !b.closest('.fassung:not(.an)'); });
      (function naechstes(){ var b=liste.shift(); if(!b)return; var w=b.complete?Promise.resolve():new Promise(function(r){ b.addEventListener('load',r,{once:true}); b.addEventListener('error',r,{once:true}); }); w.then(function(){ return b.decode?b.decode():null; }).catch(function(){}).then(function(){ spaeter(naechstes); }); })();
    });

    // Gruppen pulsieren einmal, nachdem sie gelandet sind
    var po=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ var g=e.target; po.unobserve(g); setTimeout(function(){ g.classList.add('gepulst'); },900); } });
    },{rootMargin:'0px 0px -20% 0px'});
    document.querySelectorAll('.puls').forEach(function(g){ po.observe(g); });

    // Grosse Zahlen zählen hoch
    var zo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return; zo.unobserve(e.target);
        var el=e.target, ziel=Number(el.dataset.zahl), t0=performance.now(), dauer=1400;
        (function schritt(t){ var p=Math.min(1,(t-t0)/dauer), w=1-Math.pow(1-p,3); el.textContent=Math.round(ziel*w); if(p<1)requestAnimationFrame(schritt); })(t0);
      });
    },{rootMargin:'0px 0px -10% 0px'});
    document.querySelectorAll('[data-zahl]').forEach(function(el){ el.textContent='0'; zo.observe(el); });

    // Videos laufen nur, solange man sie sieht
    var vo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        var vid=e.target;
        if(e.isIntersecting){ if(vid.dataset.src&&!vid.src)vid.src=vid.dataset.src; var p=vid.play(); if(p&&p.catch)p.catch(function(){}); }
        else vid.pause();
      });
    },{rootMargin:'200px 0px'});
    document.querySelectorAll('video').forEach(function(vid){ vo.observe(vid); });
  }

  // Bildwahl je Abschnitt: Leiste nur dort sichtbar, Pfeiltasten wechseln
  var aktiv=null;
  document.querySelectorAll('.wahl').forEach(function(wahl){
    var bilder=JSON.parse(wahl.dataset.bilder), name=wahl.querySelector('span'), bild=document.getElementById(wahl.dataset.ziel), nr=0;
    bilder.forEach(function(b){ var i=new Image(); i.src=b[0]; });
    wahl.setze=function(n){ nr=(n+bilder.length)%bilder.length; bild.src=bilder[nr][0]; name.textContent=(nr+1)+' · '+bilder[nr][1]; };
    wahl.weiter=function(d){ wahl.setze(nr+d); };
    wahl.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b)wahl.weiter(Number(b.dataset.schritt)); });
    // sichtbar nur, solange das Fenster frei steht (nicht, wenn der nächste Abschnitt darüber liegt)
    var feld=bild.closest('.standbild')||bild.parentNode;
    function pruefe(){
      var r=feld.getBoundingClientRect(), an=r.top<innerHeight*.5&&r.top>-innerHeight*.45;
      wahl.classList.toggle('sichtbar',an);
      if(an)aktiv=wahl; else if(aktiv===wahl)aktiv=null;
    }
    var pw=false; addEventListener('scroll',function(){ if(pw)return; pw=true; requestAnimationFrame(function(){ pw=false; pruefe(); }); },{passive:true}); pruefe();
  });
  addEventListener('keydown',function(e){ var z=aktivFass||aktiv; if(!z)return; if(e.key==='ArrowRight')z.weiter(1); if(e.key==='ArrowLeft')z.weiter(-1); });

  // Kacheln aufklappen
  document.querySelectorAll('.ausbildung .auf').forEach(function(k){
    k.addEventListener('click',function(){
      var t=k.closest('.ausbildung'), offen=!t.classList.contains('offen');
      t.classList.toggle('offen',offen); k.setAttribute('aria-expanded',offen);
      k.firstChild.nodeValue=offen?W.weniger:W.mehr;
      if(offen) requestAnimationFrame(function(){ t.classList.add('offen'); });
    });
  });

  // Texte, die erst beim Bedienen erscheinen, in der Sprache der Seite
  var SP=(document.documentElement.lang||'de').slice(0,2);
  var W={de:{bereit:'Bereit',minute:'eine Minute',start:'Eine Minute mitatmen ',halt:'Anhalten ',ein:'Einatmen',aus:'Ausatmen',fertig:'Schön.',gut:'Gut gemacht',noch:'noch ',sek:' Sekunden',mehr:'Mehr erfahren ',weniger:'Weniger '},
         en:{bereit:'Ready',minute:'one minute',start:'Breathe along for one minute ',halt:'Stop ',ein:'Breathe in',aus:'Breathe out',fertig:'Lovely.',gut:'Well done',noch:'',sek:' seconds left',mehr:'Learn more ',weniger:'Less '},
         es:{bereit:'Listo',minute:'un minuto',start:'Respirar un minuto ',halt:'Parar ',ein:'Inspire',aus:'Espire',fertig:'Muy bien.',gut:'Bien hecho',noch:'quedan ',sek:' segundos',mehr:'Saber más ',weniger:'Menos '}}[SP]||null;
  if(!W) W={bereit:'Bereit',minute:'eine Minute',start:'Eine Minute mitatmen ',halt:'Anhalten ',ein:'Einatmen',aus:'Ausatmen',fertig:'Schön.',gut:'Gut gemacht',noch:'noch ',sek:' Sekunden',mehr:'Mehr erfahren ',weniger:'Weniger '};

  // Ein Moment Ruhe: vier Sekunden ein, sechs aus, eine Minute lang
  document.querySelectorAll('.atem-feld').forEach(function(feld){
    var kugel=feld.querySelector('.atem-kugel'), wort=feld.querySelector('.atem-wort'), zeit=feld.querySelector('.atem-zeit');
    var knopf=feld.parentNode.parentNode.querySelector('.atem-start'), lauf=null, ende=0;
    function stop(){ clearTimeout(lauf); lauf=null; kugel.className='atem-kugel'; wort.textContent=W.bereit; zeit.textContent=W.minute; knopf.firstChild.nodeValue=W.start; }
    function ein(){ if(Date.now()>ende){ stop(); wort.textContent=W.fertig; zeit.textContent=W.gut; return; } kugel.className='atem-kugel ein'; wort.textContent=W.ein; rest(); lauf=setTimeout(aus,4000); }
    function aus(){ kugel.className='atem-kugel aus'; wort.textContent=W.aus; rest(); lauf=setTimeout(ein,6000); }
    function rest(){ zeit.textContent=W.noch+Math.max(0,Math.ceil((ende-Date.now())/1000))+W.sek; }
    knopf.addEventListener('click',function(){ if(lauf){ stop(); return; } ende=Date.now()+60000; knopf.firstChild.nodeValue=W.halt; ein(); });
  });

  // Auswahlknöpfe: einzeln oder mehrfach
  document.querySelectorAll('.wahlreihe').forEach(function(r){
    r.addEventListener('click',function(e){
      var k=e.target.closest('.wahlknopf'); if(!k)return;
      if(r.hasAttribute('data-mehrfach')){ k.setAttribute('aria-pressed',k.getAttribute('aria-pressed')==='true'?'false':'true'); }
      else { [].forEach.call(r.querySelectorAll('.wahlknopf'),function(x){ x.setAttribute('aria-pressed',x===k?'true':'false'); }); }
    });
  });
  function gewaehlt(r){ return r?[].map.call(r.querySelectorAll('.wahlknopf[aria-pressed="true"]'),function(x){ return x.textContent.trim(); }).join(', '):''; }

  // Terminanfrage: öffnet die E-Mail mit allen Angaben, es wird nichts gespeichert
  var anfrage=document.getElementById('terminanfrage');
  if(anfrage) anfrage.addEventListener('submit',function(e){
    e.preventDefault();
    var f=anfrage.elements, z=[];
    z.push('Name: '+f.name.value); z.push('Telefon: '+f.telefon.value); if(f.email.value)z.push('E-Mail: '+f.email.value);
    z.push('Ort: '+(gewaehlt(anfrage.querySelector('[data-feld="ort"]'))||'egal'));
    z.push('Wunschzeit: '+(gewaehlt(anfrage.querySelector('[data-feld="zeit"]'))||'egal'));
    z.push(''); z.push(f.anliegen.value);
    location.href='mailto:info@physio-sroka.de?subject='+encodeURIComponent('Terminanfrage von '+f.name.value)+'&body='+encodeURIComponent(z.join('\n'));
  });

  // Fragebogen (Demo): zeigt eine Zusammenfassung zum Ausdrucken, sendet und speichert nichts
  var bogen=document.getElementById('fragebogen');
  if(bogen) bogen.addEventListener('submit',function(e){
    e.preventDefault();
    var dl=document.querySelector('.zusammenfassung dl'); dl.innerHTML='';
    [].forEach.call(bogen.querySelectorAll('[data-titel]'),function(feld){
      var wert=feld.classList.contains('wahlreihe')?gewaehlt(feld):feld.value; if(!wert)return;
      var dt=document.createElement('dt'), dd=document.createElement('dd'); dt.textContent=feld.dataset.titel; dd.textContent=wert; dl.appendChild(dt); dl.appendChild(dd);
    });
    var z=document.querySelector('.zusammenfassung'); z.classList.add('da'); z.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // Leiste verschwindet beim Runterscrollen und kommt beim Hochscrollen wieder
  var leiste=document.getElementById('leiste'), letzt=0, hell=document.querySelectorAll('.hellgrund,.sandgrund,.tapete-hell');
  var geplant=false;
  addEventListener('scroll',function(){ if(geplant)return; geplant=true; requestAnimationFrame(function(){ geplant=false; leisteNach(); }); },{passive:true});
  function leisteNach(){
    var y=scrollY;
    leiste.classList.toggle('weg',y>letzt&&y>200);
    letzt=y;
    var aufHell=false;
    hell.forEach(function(s){ var r=s.getBoundingClientRect(); if(r.top<40&&r.bottom>40)aufHell=true; });
    leiste.classList.toggle('hell',aufHell);
  }
})();
