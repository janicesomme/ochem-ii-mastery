from pathlib import Path
import base64,json,html,re
import fitz
P=Path(__file__).parent
# Recover embedded source crops when rebuilding from a repository checkout.
approved=P/'crop-qa/approved'
if not approved.exists() and (P/'sites-that-matter-v1.html').exists():
 approved.mkdir(parents=True)
 embedded=re.findall(r'href="data:image/png;base64,([^"]+)"',(P/'sites-that-matter-v1.html').read_text())
 for key,data in zip(['smith_17_41a','smith_17_42ab','smith_17_44'],embedded):
  (approved/(key+'.png')).write_bytes(base64.b64decode(data))
cards=[dict(id='smith_17_41a',title='1. Two C=O groups. Only one changes.',ref='Smith 17.41(a) · solutions page 17–17',box=[170,464,591,546],intro='Start with NaBH₄. It changes the ketone into an alcohol. The ester stays as it is.',states=[dict(label='Show the sites',text='Look at the amber boxes: change C=O into C–OH and add H to that carbon. The dashed boxes mark the ester. Its extra oxygen tells you this is a different group, so NaBH₄ leaves it alone.',on=[[241,469,265,511],[476,468,511,511]],keep=[[292,485,349,539],[531,485,585,539]])],check='Which clue tells you the other C=O belongs to an ester?',answer='Its carbon is also bonded to an oxygen that joins another carbon group. That extra oxygen changes which reagent works.'),
dict(id='smith_17_42ab',title='2. Same molecule. Change the reagent, then look again.',ref='Smith 17.42(a–b) · solutions page 17–17',box=[224,685,970,854],intro='In (a), two sites change. In (b), the ester also reacts—and the molecule separates into two pieces.',states=[dict(label='(a) NaBH₄: two sites',text='Find the ketone on the left and the aldehyde on the right. Turn both into alcohols. Keep the ester, the ring double bond, and the OH already on the ring.',on=[[276,691,303,735],[431,692,475,740],[654,691,684,735],[825,715,858,746]],keep=[[332,714,377,759],[703,714,753,761]]),dict(label='(b) LiAlH₄: add the ester',text='Make those same two alcohol changes. Now change the ester too: its C=O end becomes CH₂OH, and its other oxygen becomes OH on the ring piece. The ester link opens. Keep the ring C=C.',on=[[276,691,303,735],[431,692,475,740],[332,714,377,759],[653,783,684,820],[724,800,755,831],[794,783,829,820],[905,791,939,825]],keep=[])],check='Does the OH already on the ring mean that site has reacted in (a)?',answer='No. It was already there. Compare the starting structure with the product before counting new OH groups.'),
dict(id='smith_17_44',title='3. A large molecule. Three familiar steps.',ref='Smith 17.44 · solutions page 17–18',box=[160,482,980,976],intro='Follow the same upper site through the first two steps. Before the final step, scan the whole molecule again.',states=[dict(label='1 · PCC',text='Find the upper OH. PCC turns this secondary alcohol into C=O. Keep the surrounding skeleton.',on=[[250,497,291,537],[524,497,557,537]],keep=[]),dict(label='2 · Add the carbon piece',text='The carbon attached to MgBr joins the new C=O carbon. After water, that site has OH and the added carbon piece. Keep the double bond in the incoming piece.',on=[[524,497,557,537],[663,540,726,590],[823,484,886,540]],keep=[]),dict(label='3 · Ozone: find BOTH C=C sites',text='There are now two C=C bonds outside the benzene rings: the new one at the top and the older one below. Cut each C=C and put C=O at both cut ends. This gives the large product plus formaldehyde and benzaldehyde. Keep the benzene rings.',on=[[843,484,866,521],[789,607,808,645],[842,746,870,787],[781,875,809,916],[889,741,951,769],[872,893,905,939]],keep=[])],check='Why must you look again before the ozone step?',answer='The previous step added another C=C. Looking only at the original molecule would miss one of the two sites that ozone changes.')]
def svg(c,state=None,static=False):
 x0,y0,x1,y1=c['box'];w=x1-x0;h=y1-y0
 data=base64.b64encode((P/'crop-qa/approved'/f"{c['id']}.png").read_bytes()).decode()
 content=f'<image x="0" y="0" width="{w}" height="{h}" href="data:image/png;base64,{data}"/>'
 for i,s in enumerate(c['states']):
  if static and i!=state: continue
  style='' if state==i else 'display:none'
  content+=f'<g class="marks state-{i}" style="{style}">'
  for kind in ['on','keep']:
   for a,b,d,e in s[kind]:
    color='#ba7600' if kind=='on' else '#707a83';dash='' if kind=='on' else 'stroke-dasharray="4 3"'
    content+=f'<rect x="{a-x0}" y="{b-y0}" width="{d-a}" height="{e-b}" rx="4" fill="none" stroke="{color}" stroke-width="1.7" {dash}/>'
  content+='</g>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape(c["title"])}">{content}</svg>'
sections=[]
for c in cards:
 buttons='<button data-state="-1" aria-pressed="true">Original drawing</button>'+''.join(f'<button data-state="{i}" aria-pressed="false">{html.escape(s["label"])}</button>' for i,s in enumerate(c['states']))
 sections.append(f'<section><h2>{c["title"]}</h2><p>{c["intro"]}</p><div class="buttons">{buttons}</div><div class="scroll"><div class="diagram">{svg(c)}</div></div><p class="explanation" aria-live="polite">Choose a step above to highlight its sites.</p><details><summary>Quick check: {c["check"]}</summary><p>{c["answer"]}</p></details><p class="source">{c["ref"]}</p></section>')
 for i,s in enumerate(c['states']):
  vector=svg(c,i,True)
  (P/f'{c["id"]}-step{i+1}.svg').write_text(vector)
  doc=fitz.open(stream=vector.encode(),filetype='svg')
  doc[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(P/f'{c["id"]}-step{i+1}.png')
css='''body{margin:0;background:#f2f5f3;color:#24332f;font:18px/1.6 system-ui,sans-serif}main{max-width:1060px;margin:auto;padding:30px}h1,h2{line-height:1.25;color:#1c5046}h1{font-size:38px}h2{font-size:26px}section{background:white;border:1px solid #dbe4df;border-radius:14px;padding:26px;margin:28px 0}.eyebrow,.source{font-size:14px;color:#596b64}.legend{background:#fff7e2;padding:14px;border-left:5px solid #ba7600}.buttons{display:flex;gap:9px;flex-wrap:wrap;margin:20px 0}button{font:inherit;font-size:15px;background:white;border:1px solid #7b8a83;border-radius:7px;padding:10px 14px;cursor:pointer}button[aria-pressed=true]{background:#1c5046;color:white}.scroll{overflow-x:auto}.diagram{min-width:850px;padding:10px 0}svg{display:block;width:100%;height:auto}.explanation{padding:16px;background:#f3f7f4;border-radius:8px;min-height:60px}details{border-top:1px solid #dbe4df;padding-top:14px}summary{cursor:pointer;font-weight:600}footer{font-size:14px}button:focus-visible,summary:focus-visible{outline:3px solid #ba7600;outline-offset:3px}@media(max-width:700px){main{padding:12px}section{padding:16px}h1{font-size:30px}}'''
script='''const content=DATA;document.querySelectorAll('section').forEach((section,k)=>{section.querySelectorAll('button').forEach(button=>{button.addEventListener('click',()=>{const index=Number(button.dataset.state);section.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));section.querySelectorAll('.marks').forEach(g=>{g.style.display='none'});if(index>=0)section.querySelector('.state-'+index).style.display='';section.querySelector('.explanation').textContent=index<0?'Choose a step above to highlight its sites.':content[k].states[index].text;});});});'''.replace('DATA',json.dumps(cards,ensure_ascii=False))
page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sites That Matter — Chapter 17 v1</title><style>'+css+'</style><main><p class="eyebrow">NO FEAR OCHEM · VISUAL TEACHING SAMPLE · V1</p><h1>Sites That Matter</h1><p>Find the few places that change. Keep the rest of the drawing in view while you check.</p><p class="legend"><strong>Amber outline:</strong> the site involved in this step, or its changed product site. <strong>Gray dashed outline:</strong> a look-alike group to check that stays unchanged in this step. These outlines do not show electron charge.</p><p class="eyebrow">Select a button to compare the original drawing with highlighted sites. On a narrow screen, scroll the diagram sideways.</p>'+''.join(sections)+'<footer>Private editorial sample using the supplied Smith solutions. The original structures are preserved; the outlines are teaching annotations. Wording and highlight choices are ready for Janice’s edits.</footer></main><script>'+script+'</script></html>'
(P/'sites-that-matter-v1.html').write_text(page)
(P/'teaching-copy.json').write_text(json.dumps(cards,indent=2,ensure_ascii=False))
md='# Sites That Matter — editable teaching copy\n\nAmber outlines identify the current sites. Gray dashed outlines identify unchanged look-alike groups. Source structures remain intact.\n'
for c in cards:
 md+=f'\n## {c["title"]}\n\n{c["ref"]}\n\n{c["intro"]}\n'
 for st in c['states']:md+=f'\n### {st["label"]}\n\n{st["text"]}\n'
 md+=f'\n**Quick check:** {c["check"]}\n\n**Answer:** {c["answer"]}\n'
(P/'sites-that-matter-copy.md').write_text(md)
print('Created HTML, editable copy, and six annotated SVG/PNG previews.')
