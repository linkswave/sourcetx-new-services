(()=>{
  const KINDS=[
    {key:'applications',label:'Applications'},
    {key:'messages',label:'Messages'},
    {key:'talent-requests',label:'Talent Requests'},
    {key:'chat-captures',label:'Chat Captures'},
    {key:'jobs',label:'Jobs'},
    {key:'sync',label:'Job Sync'},
    {key:'content',label:'Content'}
  ];
  let state={tab:'applications',data:[],filter:'all',query:''};
  const tabs=document.getElementById('tabs'),view=document.getElementById('view'),modal=document.getElementById('modal'),modalCard=document.getElementById('modalCard');

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate=s=>{if(!s)return'';const d=new Date(s);return isNaN(d)?s:d.toLocaleString()};
  const toast=(msg,isErr)=>{let el=document.getElementById('statusToast');if(!el){el=document.createElement('div');el.id='statusToast';el.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#0A1B31;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;z-index:99;box-shadow:0 6px 20px rgba(0,0,0,.25)';document.body.appendChild(el);}el.textContent=msg;el.style.background=isErr?'var(--danger)':'#0A1B31';el.style.display='block';clearTimeout(el._t);el._t=setTimeout(()=>{el.style.display='none'},3500);};
  const api=async(path,opts)=>{const res=await fetch(path,{headers:{'Content-Type':'application/json'},...opts});const json=await res.json().catch(()=>({}));if(!res.ok)throw new Error(json.message||`Request failed (${res.status})`);return json};

  function renderTabs(){
    tabs.innerHTML=KINDS.map(k=>`<button class="tab${state.tab===k.key?' active':''}" data-tab="${k.key}">${k.label}</button>`).join('');
    tabs.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  }

  function switchTab(tab){
    state.tab=tab;state.query='';state.filter='all';state.data=[];
    renderTabs();load();
  }

  async function load(){
    view.innerHTML='<p class="empty">Loading…</p>';
    try{
      if(state.tab==='sync')return renderJobSync();
      const res=await api(`/api/admin/${state.tab}`);
      state.data=res.data||[];
      render();
    }catch(e){
      view.innerHTML=`<p class="empty" style="color:var(--danger)">${esc(e.message)}</p>`;
    }
  }

  function render(){
    if(state.tab==='jobs')return renderJobs();
    if(state.tab==='content')return renderContent();
    const rows=filterRows();
    const q=esc(state.query);
    const csvLink=`/admin/export/${state.tab}.csv`;
    view.innerHTML=`
      <div class="toolbar">
        <input type="search" id="search" placeholder="Search name, email, or message…" value="${q}">
        <select id="filter">
          <option value="all"${state.filter==='all'?' selected':''}>All</option>
          <option value="unread"${state.filter==='unread'?' selected':''}>Unread</option>
          <option value="read"${state.filter==='read'?' selected':''}>Read</option>
        </select>
        <a class="btn" href="${csvLink}">Export CSV</a>
      </div>
      <div id="list">${rows.length?rows.map(cardFor()).join(''):'<p class="empty">No records found.</p>'}</div>`;
    document.getElementById('search').addEventListener('input',e=>{state.query=e.target.value;rerenderList()});
    document.getElementById('filter').addEventListener('change',e=>{state.filter=e.target.value;rerenderList()});
  }

  function cardFor(){return state.tab==='applications'?cardApplication:state.tab==='chat-captures'?cardChat:cardGeneric;}

  function rerenderList(){
    const rows=filterRows();
    document.getElementById('list').innerHTML=rows.length?rows.map(cardFor()).join(''):'<p class="empty">No records found.</p>';
  }

  function filterRows(){
    const q=state.query.toLowerCase();
    return state.data.filter(r=>{
      if(state.filter==='unread'&&r.read)return false;
      if(state.filter==='read'&&!r.read)return false;
      if(!q)return true;
      return JSON.stringify(r).toLowerCase().includes(q);
    });
  }

  function repliesHtml(r){
    if(!r.replies||!r.replies.length)return'';
    return `<div class="replies">${r.replies.map(p=>`<div class="reply"><div class="rhead">Replied to ${esc(p.to)} · ${esc(fmtDate(p.at))} · ${esc(p.subject)}</div>${esc(p.body)}</div>`).join('')}</div>`;
  }

  function actionsHtml(r){
    const reply=state.tab==='chat-captures'?'':`<button class="btn small" data-action="reply">Reply</button>`;
    return `<div class="actions">${reply}
      <button class="btn small" data-action="read">Mark ${r.read?'Unread':'Read'}</button>
    </div>`;
  }

  function cardChat(r){
    const who=r.email?esc(r.email):'<span class="muted">No email</span>';
    return `<article class="panel${r.read?'':' unread'}">
      <div class="head"><div><span class="dot ${r.read?'read':'unread'}"></span><span class="who">Unanswered chat question</span>
        <div class="meta">${who} · ${esc(fmtDate(r.submittedAt))}${r.intent&&r.intent!=='none'?' · intent: '+esc(r.intent):''}</div></div></div>
      <div class="body">${esc(r.question||'—')}</div>${actionsHtml(r)}
    </article>`;
  }

  function cardGeneric(r){
    const title=r.company?`${esc(r.company)}`:(r.topic?esc(r.topic):esc(r.name));
    const who=r.company?`${esc(r.name)} (${esc(r.email)})`:esc(r.email);
    const extra=r.service||r.targetDate?`<div class="kv">${[r.service,r.targetDate].filter(Boolean).map(esc).join(' · ')}</div>`:'';
    const body=r.needs||r.message;
    return `<article class="panel${r.read?'':' unread'}">
      <div class="head"><div><span class="dot ${r.read?'read':'unread'}"></span><span class="who">${title}</span><div class="meta">${who} · ${esc(fmtDate(r.submittedAt))}</div>${extra}</div></div>
      <div class="body">${esc(body)}</div>${repliesHtml(r)}${actionsHtml(r)}
    </article>`;
  }

  function cardApplication(r){
    return `<article class="panel${r.read?'':' unread'}">
      <div class="head">
        <div><span class="dot ${r.read?'read':'unread'}"></span><span class="who">${esc(r.name)}</span>
          <div class="meta">${esc(r.jobTitle)} · ${esc(r.email)} · ${esc(r.phone||'—')}${r.location?' · '+esc(r.location):''} · ${esc(fmtDate(r.submittedAt))}</div>
          ${r.workAuthorization?`<span class="chip">Auth: ${esc(r.workAuthorization)}</span>`:''}${r.linkedin?`<span class="chip">${esc(r.linkedin)}</span>`:''}</div>
        <a class="btn small" href="/uploads/${encodeURIComponent(r.resume)}" target="_blank">${esc(r.originalResumeName||'CV')}</a>
      </div>
      <div class="body">${esc(r.message||'—')}</div>${repliesHtml(r)}${actionsHtml(r)}
    </article>`;
  }

  function ageDays(j){
    const s=j&&(j.refreshedAt||j.posted);if(!s)return null;
    const a=new Date(String(s).slice(0,10)+'T00:00:00Z');if(isNaN(a))return null;
    return Math.max(0,Math.floor((Date.now()-a.getTime())/86400000));
  }
  function sourceLabel(j){
    const src=(j.source&&j.source!=='Direct')?j.source:null;
    return `${src?`${esc(src)} · `:''}${ageDays(j)===null?'no date':ageDays(j)+'d live'}`;
  }

  function renderJobs(){
    const jobs=state.data;
    view.innerHTML=`
      <div class="toolbar">
        <button class="btn primary" id="addJob">+ Add Job</button>
        <button class="btn" id="goSync">⇄ Import from job boards</button>
        <a class="btn" href="/">View Jobs Page</a>
      </div>
      <div class="panel"><table class="jobs"><thead><tr><th>Title / Source</th><th>Location</th><th>Type</th><th>Department</th><th>Live since</th><th>Status</th><th></th></tr></thead>
      <tbody>${jobs.length?jobs.map(j=>`<tr>
        <td><strong>${esc(j.title)}</strong>${j.source||j.sourceUrl?`<div class="kv">${sourceLabel(j)}${j.sourceUrl?`<br><a href="${escAttr(j.sourceUrl)}" target="_blank" rel="noopener">view posting ↗</a>`:''}</div>`:''}</td>
        <td>${esc(j.location)}</td><td>${esc(j.type)}</td><td>${esc(j.department)}</td><td>${esc(j.posted)}</td>
        <td><span class="tag ${j.active!==false?'on':'off'}">${j.active!==false?'Active':'Closed'}</span></td>
        <td style="white-space:nowrap">
          <button class="btn small" data-job-edit="${esc(j.id)}">Edit</button>
          ${j.active!==false?`<button class="btn small" data-job-renew="${esc(j.id)}" title="Keep live for another auto-close period">Renew</button>`:''}
          <button class="btn small" data-job-toggle="${esc(j.id)}">${j.active!==false?'Close':'Reopen'}</button>
        </td></tr>`).join(''):'<tr><td colspan="7" class="empty">No jobs yet.</td></tr>'}</tbody></table></div>
      <p class="muted">Roles imported from job boards (LinkedIn, Monster, ZipRecruiter, …) are automatically marked <strong>Closed</strong> and hidden from the website when they have not been refreshed within the auto-close period. Use <strong>Renew</strong> when you confirm a role is still open. Manage this on the <strong>Job Sync</strong> tab.</p>`;
    document.getElementById('addJob').addEventListener('click',()=>openJobModal(null));
    document.getElementById('goSync').addEventListener('click',()=>switchTab('sync'));
    view.querySelectorAll('[data-job-edit]').forEach(b=>b.addEventListener('click',()=>openJobModal(jobs.find(j=>j.id===b.dataset.jobEdit))));
    view.querySelectorAll('[data-job-renew]').forEach(b=>b.addEventListener('click',async()=>{
      const j=jobs.find(x=>x.id===b.dataset.jobRenew);
      b.disabled=true;b.textContent='Renewing…';
      try{await api(`/api/admin/jobs/renew/${encodeURIComponent(j.id)}`,{method:'POST',body:JSON.stringify({})});await load();}
      catch(e){toast(e.message,true)}
    }));
    view.querySelectorAll('[data-job-toggle]').forEach(b=>b.addEventListener('click',async()=>{
      const j=jobs.find(x=>x.id===b.dataset.jobToggle);
      try{await api(`/api/admin/jobs/${encodeURIComponent(j.id)}`,{method:'PUT',body:JSON.stringify({active:j.active!==false?false:true})});await load();}
      catch(e){toast(e.message,true)}
    }));
  }

  /* ---------------- Job Sync: import + auto-close ---------------- */
  async function renderJobSync(){
    view.innerHTML='<p class="empty">Loading…</p>';
    let res;
    try{res=await api('/api/admin/jobs/sync');}
    catch(e){view.innerHTML=`<p class="empty" style="color:var(--danger)">${esc(e.message)}</p>`;return;}
    const s=res.settings,st=res.stats||{},sources=res.sources||[];
    const bySource=Object.entries(st.bySource||{}).map(([k,v])=>({k,v})).sort((a,b)=>b.v-a.v);
    const stale=st.stale||[];
    const modeName={'sourced':'Board-imported roles only','all':'Every opening','off':'Never (manual close only)'}[s.autoCloseMode]||'';
    view.innerHTML=`
      <div class="toolbar">
        <button class="btn" id="backJobs">← Jobs list</button>
        <button class="btn primary" id="openImport">+ Import from a job board</button>
        <button class="btn" id="openCsv">Paste CSV import…</button>
        ${stale.length?`<button class="btn" id="expireNow">Close ${stale.length} stale opening${stale.length===1?'':'s'} now</button>`:''}
      </div>

      <div class="panel"><h3 style="margin:0 0 10px">Auto-close rule</h3>
        <p class="muted" style="margin-top:0">Openings that have been live for more than the period below, without being refreshed, are marked <strong>Closed</strong> and disappear from the website automatically (checked hourly and on each save).</p>
        <label style="display:inline-flex;align-items:center;gap:8px;font-weight:600;margin-bottom:10px"><input type="checkbox" id="sc-enabled" ${s.enabled?'checked':''}> Auto-close is enabled</label>
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:end">
          <div><label class="muted" style="display:block;font-weight:600">Close openings not refreshed within</label>
            <input type="number" id="sc-days" min="1" max="365" value="${s.autoCloseDays}" style="width:90px"> <span class="muted">days</span></div>
          <div><label class="muted" style="display:block;font-weight:600">Apply to</label>
            <select id="sc-mode">
              <option value="sourced"${s.autoCloseMode==='sourced'?' selected':''}>Board-imported roles only</option>
              <option value="all"${s.autoCloseMode==='all'?' selected':''}>Every opening</option>
              <option value="off"${s.autoCloseMode==='off'?' selected':''}>Never (close manually)</option>
            </select></div>
          <button class="btn primary" id="sc-save">Save rule</button>
        </div>
        <p class="status" id="sc-status"></p>
      </div>

      <div class="panel"><h3 style="margin:0 0 8px">Current openings</h3>
        <p class="muted" style="margin-top:0">${st.total} total · <span class="tag on">${st.active} live</span> <span class="tag off">${st.closed} closed</span></p>
        <div class="meta">${bySource.length?bySource.map(b=>`<span class="chip">${esc(b.k)}: ${b.v}</span>`).join(''):''}</div>
      </div>

      <div class="panel"><h3 style="margin:0 0 8px">Stale openings (ready to auto-close)</h3>
        ${stale.length?`<p class="muted" style="margin-top:0">These have been live longer than ${s.autoCloseDays} days without a refresh. <strong>Renew</strong> the ones still open, or click <strong>Close now</strong> to remove them from the website.</p>
        ${stale.map(j=>`<article class="citem" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <div><strong>${esc(j.title)}</strong> <span class="chip">${sourceLabel(j)}</span><div class="kv">${esc(j.location||'')}${j.sourceUrl?` · <a href="${escAttr(j.sourceUrl)}" target="_blank" rel="noopener">posting ↗</a>`:''}</div></div>
          <div class="actions" style="margin-top:0"><button class="btn small primary" data-renew="${esc(j.id)}">Renew — still open</button></div>
        </article>`).join('')}`
        :'<p class="empty" style="padding:16px">No stale openings. Everything live has been refreshed within the auto-close period.</p>'}
      </div>`;
    const stStatus=document.getElementById('sc-status');
    document.getElementById('backJobs').addEventListener('click',()=>switchTab('jobs'));
    document.getElementById('openImport').addEventListener('click',()=>openSyncModal(res));
    document.getElementById('openCsv').addEventListener('click',()=>openCsvModal());
    document.getElementById('sc-save').addEventListener('click',async()=>{
      const body={enabled:document.getElementById('sc-enabled').checked,
        autoCloseDays:parseInt(document.getElementById('sc-days').value,10)||45,
        autoCloseMode:document.getElementById('sc-mode').value};
      stStatus.className='status';stStatus.textContent='Saving…';
      try{const r=await api('/api/admin/jobs/sync',{method:'POST',body:JSON.stringify(body)});
        stStatus.className='status ok';stStatus.textContent=(r.message||'Saved.')+(body.enabled?` Auto-close will close roles not refreshed within ${body.autoCloseDays} days.`:' Auto-close is off.');
        setTimeout(()=>stStatus.textContent='',4000);
        renderJobSync();
      }catch(e){stStatus.className='status err';stStatus.textContent=e.message}
    });
    const exp=document.getElementById('expireNow');
    if(exp)exp.addEventListener('click',async()=>{
      if(!confirm(`Close ${stale.length} stale opening${stale.length===1?'':'s'}? They will be removed from the website (still visible here under Jobs list).`))return;
      exp.disabled=true;exp.textContent='Closing…';
      try{const r=await api('/api/admin/jobs/expire',{method:'POST',body:JSON.stringify({})});toast(r.message||'Done');await renderJobSync();}
      catch(e){toast(e.message,true)}
    });
    view.querySelectorAll('[data-renew]').forEach(b=>b.addEventListener('click',async()=>{
      b.disabled=true;b.textContent='Renewing…';
      try{await api(`/api/admin/jobs/renew/${encodeURIComponent(b.dataset.renew)}`,{method:'POST',body:JSON.stringify({})});await renderJobSync();}
      catch(e){toast(e.message,true)}
    }));
  }

  function openSyncModal(res){
    const sources=(res&&res.sources)||[];
    const now=new Date().toISOString().slice(0,10);
    modalCard.innerHTML=`
      <h2>Import an opening from a job board</h2>
      <p class="muted" style="margin-top:-8px">Paste the job posting from LinkedIn, Monster, ZipRecruiter, or another site. SourceTX adds it as a new opening, or — if the same role already exists (matched by posting URL or title + location) — refreshes it and keeps it live.</p>
      <label>Board / source</label>
      <select id="imp-source">${sources.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
      <label>Link to the original posting (URL)</label>
      <input id="imp-url" type="url" placeholder="https://www.linkedin.com/jobs/view/…">
      <label>Job title *</label><input id="imp-title" type="text">
      <div class="row">
        <div><label>Location</label><input id="imp-location" type="text" placeholder="City, state / Remote"></div>
        <div><label>Type</label><input id="imp-type" type="text" placeholder="Contract / Full-time"></div>
      </div>
      <div class="row">
        <div><label>Department</label><input id="imp-dept" type="text"></div>
        <div><label>Posted on board</label><input id="imp-posted" type="date" value="${now}"></div>
      </div>
      <label>Summary</label><input id="imp-summary" type="text">
      <label>Full description</label><textarea id="imp-desc" rows="4" placeholder="What the role involves and what you are looking for. You can also list each responsibility/requirement on its own line."></textarea>
      <div class="actions">
        <button class="btn" id="imp-cancel">Cancel</button>
        <button class="btn primary" id="imp-save">Import</button>
      </div>
      <p class="status" id="imp-status"></p>`;
    modal.classList.add('open');
    document.getElementById('imp-cancel').addEventListener('click',()=>modal.classList.remove('open'));
    document.getElementById('imp-save').addEventListener('click',async()=>{
      const st=document.getElementById('imp-status');
      const title=document.getElementById('imp-title').value.trim();
      if(!title){st.className='status err';st.textContent='Job title is required.';return}
      const desc=document.getElementById('imp-desc').value.trim();
      const row={title,source:document.getElementById('imp-source').value,sourceUrl:document.getElementById('imp-url').value.trim(),location:document.getElementById('imp-location').value.trim(),type:document.getElementById('imp-type').value.trim(),department:document.getElementById('imp-dept').value.trim(),posted:document.getElementById('imp-posted').value,summary:document.getElementById('imp-summary').value.trim(),description:desc};
      if(desc.includes('\n')){row.responsibilities=desc;}
      st.className='status';st.textContent='Importing…';
      try{
        const r=await api('/api/admin/jobs/import',{method:'POST',body:JSON.stringify({rows:[row]})});
        st.className='status ok';st.textContent=r.message||'Imported.';
        setTimeout(()=>{modal.classList.remove('open');renderJobSync()},900);
      }catch(e){st.className='status err';st.textContent=e.message}
    });
  }

  function openCsvModal(){
    modalCard.innerHTML=`
      <h2>Import openings from CSV</h2>
      <p class="muted" style="margin-top:-8px">Export a sheet from your job-tracking spreadsheet (or copy rows from a board dashboard) and paste it here. Header columns are matched by name — <code>title</code> is required; also recognised: location, type, department, posted, summary, description, source, url/sourceUrl, responsibilities, requirements, skills. Rows already on the site (same URL, or same title + location) are refreshed instead of duplicated.</p>
      <textarea id="csv-text" rows="10" placeholder="title,location,type,department,posted,summary,url${'\n'}Senior React Developer,Austin TX,Contract,Engineering,2026-09-01,Build our client portal,https://www.linkedin.com/jobs/view/…"></textarea>
      <div class="actions">
        <button class="btn" id="csv-cancel">Cancel</button>
        <button class="btn primary" id="csv-save">Import CSV</button>
      </div>
      <p class="status" id="csv-status"></p>`;
    modal.classList.add('open');
    document.getElementById('csv-cancel').addEventListener('click',()=>modal.classList.remove('open'));
    document.getElementById('csv-save').addEventListener('click',async()=>{
      const st=document.getElementById('csv-status');
      const csv=document.getElementById('csv-text').value;
      if(!csv.trim()){st.className='status err';st.textContent='Paste some CSV first.';return}
      st.className='status';st.textContent='Importing…';
      try{
        const r=await api('/api/admin/jobs/import/csv',{method:'POST',body:JSON.stringify({csv})});
        st.className='status ok';st.textContent=r.message||'Imported.';
        setTimeout(()=>{modal.classList.remove('open');renderJobSync()},900);
      }catch(e){st.className='status err';st.textContent=e.message}
    });
  }

  function openJobModal(job){
    const j=job||{title:'',location:'',type:'',department:'',posted:new Date().toISOString().slice(0,10),summary:'',description:'',responsibilities:[],requirements:[],skills:[],source:'',sourceUrl:'',active:true};
    const arr=(v)=>v&&v.length?v.join('\n'):'';
    const srcOptions=['Direct','LinkedIn','Monster','ZipRecruiter','Indeed','Dice','CareerBuilder','Other Board'];
    modalCard.innerHTML=`
      <h2>${job?'Edit Job':'Add Job'}</h2>
      <label>Title *</label><input id="jb-title" type="text" value="${esc(j.title)}">
      <div class="row"><div><label>Location</label><input id="jb-location" type="text" value="${esc(j.location)}"></div>
      <div><label>Type</label><input id="jb-type" type="text" value="${esc(j.type)}"></div></div>
      <div class="row"><div><label>Department</label><input id="jb-dept" type="text" value="${esc(j.department)}"></div>
      <div><label>Posted</label><input id="jb-posted" type="date" value="${esc(j.posted)}"></div></div>
      <div class="row"><div><label>Source</label><select id="jb-source">${srcOptions.map(o=>`<option value="${esc(o)}"${String(j.source||'')===o?' selected':''}>${esc(o)}</option>`).join('')}</select></div>
      <div style="flex:2"><label>Original posting URL (optional)</label><input id="jb-sourceUrl" type="url" value="${esc(j.sourceUrl)}"></div></div>
      <label>Summary</label><input id="jb-summary" type="text" value="${esc(j.summary)}">
      <label>Description</label><textarea id="jb-desc" rows="3">${esc(j.description)}</textarea>
      <label>Responsibilities (one per line)</label><textarea id="jb-resp" rows="3">${esc(arr(j.responsibilities))}</textarea>
      <label>Requirements (one per line)</label><textarea id="jb-req" rows="3">${esc(arr(j.requirements))}</textarea>
      <label>Skills (comma separated)</label><input id="jb-skills" type="text" value="${esc(j.skills&&j.skills.join(', '))}">
      <div class="actions">
        <button class="btn" id="jb-cancel">Cancel</button>
        <button class="btn primary" id="jb-save">${job?'Save':'Create'}</button>
      </div>
      <p class="status" id="jb-status"></p>`;
    modal.classList.add('open');
    const split=v=>v.split(/\n/).map(s=>s.trim()).filter(Boolean);
    const collect=()=>({
      title:document.getElementById('jb-title').value.trim(),
      location:document.getElementById('jb-location').value.trim(),
      type:document.getElementById('jb-type').value.trim(),
      department:document.getElementById('jb-dept').value.trim(),
      posted:document.getElementById('jb-posted').value,
      source:document.getElementById('jb-source').value,
      sourceUrl:document.getElementById('jb-sourceUrl').value.trim(),
      summary:document.getElementById('jb-summary').value.trim(),
      description:document.getElementById('jb-desc').value.trim(),
      responsibilities:split(document.getElementById('jb-resp').value),
      requirements:split(document.getElementById('jb-req').value),
      skills:document.getElementById('jb-skills').value.split(',').map(s=>s.trim()).filter(Boolean)
    });
    document.getElementById('jb-cancel').addEventListener('click',()=>modal.classList.remove('open'));
    document.getElementById('jb-save').addEventListener('click',async()=>{
      const body=collect();const st=document.getElementById('jb-status');
      if(!body.title){st.className='status err';st.textContent='Title is required.';return}
      try{
        if(job)await api(`/api/admin/jobs/${encodeURIComponent(job.id)}`,{method:'PUT',body:JSON.stringify(body)});
        else await api('/api/admin/jobs',{method:'POST',body:JSON.stringify(body)});
        modal.classList.remove('open');await load();
      }catch(e){st.className='status err';st.textContent=e.message}
    });
  }

  function openReplyModal(kind,rec){
    modalCard.innerHTML=`
      <h2>Reply to ${esc(rec.name||rec.company||'sender')}</h2>
      <label>To</label><input id="rp-to" type="email" value="${esc(rec.email)}">
      <label>Subject</label><input id="rp-subject" type="text" value="Re: ${esc(rec.jobTitle||rec.topic||rec.service||'your submission')}">
      <label>Message</label><textarea id="rp-body" rows="6"></textarea>
      <div class="actions">
        <button class="btn" id="rp-cancel">Cancel</button>
        <button class="btn primary" id="rp-send">Send</button>
      </div>
      <p class="status" id="rp-status"></p>`;
    modal.classList.add('open');
    document.getElementById('rp-cancel').addEventListener('click',()=>modal.classList.remove('open'));
    document.getElementById('rp-send').addEventListener('click',async()=>{
      const st=document.getElementById('rp-status');
      const body={to:document.getElementById('rp-to').value.trim(),subject:document.getElementById('rp-subject').value.trim(),body:document.getElementById('rp-body').value.trim()};
      if(!body.to||!body.subject||!body.body){st.className='status err';st.textContent='All fields are required.';return}
      try{
        const res=await api(`/api/admin/${kind}/${encodeURIComponent(rec.id)}/reply`,{method:'POST',body:JSON.stringify(body)});
        st.className='status ok';st.textContent=res.message||'Reply sent.';
        setTimeout(()=>{modal.classList.remove('open');load()},800);
      }catch(e){st.className='status err';st.textContent=e.message}
    });
  }

  view.addEventListener('click',async(e)=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const panel=btn.closest('.panel');const idx=[...view.querySelectorAll('.panel')].indexOf(panel);
    const rec=filterRows()[idx];
    if(btn.dataset.action==='reply')return openReplyModal(state.tab,rec);
    if(btn.dataset.action==='read'){
      try{await api(`/api/admin/${state.tab}/${encodeURIComponent(rec.id)}/read`,{method:'POST',body:JSON.stringify({read:!rec.read})});await load();}
      catch(e){alert(e.message)}
    }
  });

  /* ---------------- Content editor ---------------- */
  const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const isArr=v=>Array.isArray(v);
  const escAttr=s=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const labelName=k=>String(k).replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());

  function scalarField(key,val){
    const v=val===undefined||val===null?'':val;
    const path=`data-rpath="${escAttr(key)}"`;
    if(typeof val==='boolean')return `<label class="cf-check"><input type="checkbox" ${path} ${val?'checked':''}> ${esc(labelName(key))}</label>`;
    if(typeof val==='number')return `<label>${esc(labelName(key))}<input type="number" ${path} value="${escAttr(v)}"></label>`;
    const isLong=typeof val==='string'&&(val.length>80||val.includes('\n'));
    if(isLong)return `<label>${esc(labelName(key))}<textarea ${path} rows="3">${escAttr(v)}</textarea></label>`;
    return `<label>${esc(labelName(key))}<input type="text" ${path} value="${escAttr(v)}"></label>`;
  }

  function linesField(key,val){
    return `<label>${esc(labelName(key))}<textarea data-rpath="${escAttr(key)}" data-lines="1" rows="3">${escAttr((val||[]).join('\n'))}</textarea></label>`;
  }

  function objectFields(obj,indent){
    let html='';
    for(const key of Object.keys(obj)){
      const val=obj[key];
      const padded='padding-left:'+(indent*16)+'px';
      if(isObj(val)){
        html+=`<fieldset class="cf-cat" style="${padded}"><legend>${esc(labelName(key))}</legend><div class="cobj" data-opath="${escAttr(key)}">${objectFields(val,indent+1)}</div></fieldset>`;
      }else if(isArr(val)){
        if(val.length&&isObj(val[0])){
          html+=arrayOfObjectsField(key,val,indent);
        }else{
          html+=`<div class="cf-scalar" style="${padded}">${linesField(key,val)}</div>`;
        }
      }else{
        html+=`<div class="cf-scalar" style="${padded}">${scalarField(key,val)}</div>`;
      }
    }
    return html;
  }

  function arrayOfObjectsField(key,val,indent){
    const template=val.length?val[0]:{item:''};
    const padded='padding-left:'+(indent*16)+'px';
    return `<fieldset class="cf-cat" style="${padded}"><legend>${esc(labelName(key))}</legend>
      <div class="carr" data-apath="${escAttr(key)}" data-template="${escAttr(JSON.stringify(template))}">
        ${val.map(item=>`<div class="citem"><div class="cobj">${objectFields(item,indent+1)}</div><button type="button" class="btn small cf-remove">Remove</button></div>`).join('')}
      </div>
      <button type="button" class="btn small cf-add">+ Add item</button>
    </fieldset>`;
  }

  function collectObject(scope,target){
    scope.querySelectorAll(':scope > .cf-scalar').forEach(s=>{
      const inp=s.querySelector('[data-rpath]');
      if(!inp)return;
      const key=inp.dataset.rpath;
      if(inp.dataset.lines){target[key]=(inp.value||'').split('\n').map(x=>x.trim()).filter(Boolean);return}
      if(inp.type==='checkbox')target[key]=inp.checked;
      else if(inp.type==='number')target[key]=Number(inp.value);
      else target[key]=inp.value;
    });
    scope.querySelectorAll(':scope > .cf-cat').forEach(cat=>{
      const inner=cat.querySelector(':scope > .cobj');
      const arr=cat.querySelector(':scope > .carr');
      const key=(inner&&inner.dataset.opath)||(arr&&arr.dataset.apath);
      if(!key)return;
      if(inner){
        target[key]={};
        collectObject(inner,target[key]);
      }else if(arr){
        const items=arr.querySelectorAll(':scope > .citem');
        const list=[];
        items.forEach(it=>{
          const o={};
          const obj=it.querySelector(':scope > .cobj');
          if(obj)collectObject(obj,o);
          list.push(o);
        });
        target[key]=list;
      }
    });
  }

  function renderContent(){
    view.innerHTML=`
      <div class="toolbar">
        <button class="btn primary" id="contentSave">Save Content</button>
        <button class="btn" id="contentDiscard">Discard Changes</button>
        <span class="status" id="contentStatus"></span>
      </div>
      <p class="muted">Edit the text used across the website. Page, service, and legal content is stored in <code>data/content.json</code> and rendered server-side.</p>
      <div class="panel" id="contentEditor"></div>`;
    const editor=document.getElementById('contentEditor');
    const root=document.createElement('div');
    root.className='cobj';
    root.innerHTML=objectFields(state.data,0);
    editor.appendChild(root);
    editor.addEventListener('click',e=>{
      const add=e.target.closest('.cf-add');
      if(add){
        const carr=add.previousElementSibling;
        const tpl=JSON.parse(carr.dataset.template||'{"item":""}');
        const item=document.createElement('div');
        item.className='citem';
        item.innerHTML=`<div class="cobj">${objectFields(tpl,0)}</div><button type="button" class="btn small cf-remove">Remove</button>`;
        carr.appendChild(item);
        return;
      }
      const rm=e.target.closest('.cf-remove');
      if(rm)rm.closest('.citem').remove();
    });
    const status=document.getElementById('contentStatus');
    document.getElementById('contentSave').addEventListener('click',async()=>{
      const next={};
      collectObject(root,next);
      status.className='status';status.textContent='Saving…';
      try{
        const res=await api('/api/admin/content',{method:'PUT',body:JSON.stringify(next)});
        state.data=res.data;
        status.className='status ok';status.textContent=res.message||'Content saved.';
        setTimeout(()=>{status.textContent=''},2500);
      }catch(e){status.className='status err';status.textContent=e.message}
    });
    document.getElementById('contentDiscard').addEventListener('click',()=>load());
  }

  renderTabs();load();
})();
