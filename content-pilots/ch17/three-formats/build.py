from pathlib import Path
import math,json,html
import fitz
P=Path(__file__).parent
INK='#23382f';AMBER='#b87800'
def line(a,b,width=2.7,color=INK):
 return f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}" stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
def text(x,y,s,size=23):
 return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{size}" fill="{INK}">{html.escape(s)}</text>'
def mol(kind,n=4,product=False,cue=False,large=False):
 s=''
 if large:
  center=(170,140)
  ring=[(170+48*math.cos(math.radians(a)),140+48*math.sin(math.radians(a))) for a in [0,60,120,180,240,300]]
  for i in range(6):s+=line(ring[i],ring[(i+1)%6])
  for i in [0,2,4]:
   a,b=ring[i],ring[(i+1)%6]
   s+=line((170+(a[0]-170)*.79,140+(a[1]-140)*.79),(170+(b[0]-170)*.79,140+(b[1]-140)*.79),2)
  ring2=[(43+32*math.cos(math.radians(a)),140+32*math.sin(math.radians(a))) for a in [0,60,120,180,240,300]]
  for i in range(6):s+=line(ring2[i],ring2[(i+1)%6])
  s+=line((75,140),(122,140))
  chain=[(218,140),(250,160),(282,140),(314,160),(346,140)]
  for a,b in zip(chain,chain[1:]):s+=line(a,b)
  cx,cy=346,140
  assert chain[-2][1] > cy, "Terminal carbonyl must sit above the preceding carbon"
 else:
  start=205-((n-1)*42)/2
  # Janice drawing convention: upward O/OH sits on a peak, never inside a valley.
  idx=(n-1)//2 if kind=='ketone' else n-1
  chain=[(start+i*42,117 if i%2==idx%2 else 140) for i in range(n)]
  for a,b in zip(chain,chain[1:]):s+=line(a,b)
  idx=(n-1)//2 if kind=='ketone' else n-1
  cx,cy=chain[idx]
  neighbors=[chain[j] for j in [idx-1,idx+1] if 0<=j<len(chain)]
  assert all(y>cy for x,y in neighbors), "Upward group must sit on a peak"
 if cue:
  w=93 if kind=='ester' else 80 if kind=='aldehyde' and not product else 49
  s+=f'<rect x="{cx-23}" y="{cy-70}" width="{w}" height="105" rx="12" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 if product and kind!='ester':
  s+=line((cx,cy),(cx,cy-38))+text(cx+6,cy-47,'OH')
 else:
  s+=line((cx-3,cy-2),(cx-3,cy-38))+line((cx+3,cy-2),(cx+3,cy-38))+text(cx,cy-47,'O')
  if kind=='aldehyde':s+=line((cx,cy),(cx+28,cy+16))+text(cx+41,cy+29,'H')
  if kind=='ester':
   s+=line((cx,cy),(cx+23,cy+14))+text(cx+34,cy+26,'O')
   s+=line((cx+45,cy+13),(cx+67,cy))
 return s

def reaction(kind,n,missing=None,cue=False,large=False):
 left=text(210,142,'?',58) if missing=='start' else mol(kind,n,False,cue,large)
 right=text(210,142,'?',58) if missing=='product' else mol(kind,n,True,cue,large)
 reagent='?' if missing=='reagent' else 'NaBH₄'
 solvent='' if missing=='reagent' else 'methanol'
 arrow=line((442,137),(546,137))+f'<path d="M546 137 l-13 -7 v14 z" fill="{INK}"/>'
 if kind=='ester' and missing is None: solvent='no reaction'
 desc=f'{kind} reaction; '+('complete answer' if not missing else 'find '+missing)
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 245" role="img" aria-label="{desc}"><rect width="1000" height="245" fill="white"/>{left}<g transform="translate(570 0)">{right}</g>{arrow}{text(494,101,reagent,24)}{text(494,174,solvent,18)}</svg>'
questions=[
 dict(id='A1',group='2 · Repeat the aldehyde pattern',kind='aldehyde',n=5,missing='product',title='Draw the product.',clue='Find the carbon that has both a double bond to O and a bond to H.',answer='NaBH₄ turns this aldehyde into a primary alcohol. Make the bond to oxygen single and put H on the oxygen. The same carbon also gains H. Keep the chain exactly as it was.'),
 dict(id='A2',group='2 · Repeat the aldehyde pattern',kind='aldehyde',n=6,missing='product',title='One more: draw the product.',clue='The chain is longer. Does the group at the end still fit the aldehyde pattern?',answer='Yes—the end is still an aldehyde, so the same move gives a primary alcohol. A longer chain does not change this reaction.'),
 dict(id='K1',group='3 · Repeat the ketone pattern',kind='ketone',n=5,missing='product',title='Draw the product.',clue='The carbon double-bonded to O has a carbon group on each side. That makes it a ketone.',answer='NaBH₄ turns this ketone into a secondary alcohol. Make the bond to oxygen single and put H on oxygen. The same carbon also gains H. Keep both carbon groups attached.'),
 dict(id='K2',group='3 · Repeat the ketone pattern',kind='ketone',n=7,missing='product',title='One more: draw the product.',clue='Ignore the chain length for a moment. How many carbon groups are attached to the carbon double-bonded to O?',answer='There are two carbon groups attached, so this is still a ketone. NaBH₄ gives a secondary alcohol. The longer chains stay in place.'),
 dict(id='A3',group='4 · Same reaction, different question',kind='aldehyde',n=4,missing='reagent',title='Choose a reagent and solvent.',clue='Compare the two drawings. An aldehyde has become a primary alcohol, and no carbon has been added.',answer='NaBH₄ in methanol is one suitable choice. You already know this reaction—you are supplying what goes over the arrow this time. Other valid reduction conditions can also work.'),
 dict(id='A4',group='4 · Same reaction, different question',kind='aldehyde',n=5,missing='start',title='Draw the aldehyde that would give this alcohol.',clue='Start at the alcohol end and undo the reaction. Keep the carbon chain.',answer='Draw the aldehyde shown. Turn the single bond to oxygen back into a double bond and remove the H from oxygen. That end carbon has one H in the starting aldehyde. The skeletal drawing leaves most carbon-bound H implicit.'),
 dict(id='K3',group='4 · Same reaction, different question',kind='ketone',n=5,missing='reagent',title='Choose a reagent and solvent.',clue='A ketone has become a secondary alcohol. The carbon groups on either side are unchanged.',answer='NaBH₄ in methanol is one suitable choice here too. The question format changed, but the reaction pattern did not.'),
 dict(id='K4',group='4 · Same reaction, different question',kind='ketone',n=7,missing='start',title='Draw the ketone that would give this alcohol.',clue='Find the carbon carrying OH. Keep both of its carbon groups and undo the alcohol-forming change.',answer='Draw the ketone shown. Restore the double bond to oxygen and remove the H from oxygen. The H added to the middle carbon during reduction is also absent in the ketone.'),
 dict(id='B1',group='5 · Find it inside a larger molecule',kind='aldehyde',n=4,missing='product',large=True,title='Find the reacting site, then draw the product.',clue='Scan for a carbon double-bonded to O and bonded to H. The rings do not stop that end group from being an aldehyde.',answer='The aldehyde at the far right becomes a primary alcohol. Both rings and the connecting chain stay unchanged under these conditions. The highlighted answer shows the same local move as A1 and A2.'),
 dict(id='E1',group='6 · Check the limit of the rule',kind='ester',n=4,missing='product',title='Does this molecule change?',clue='Do not stop at the double bond to O. The same carbon is also bonded to another O, which joins a carbon group. That makes this an ester.',answer='No reaction under these conditions: NaBH₄ in methanol leaves this ester unchanged. The repeated starting structure below shows that no alcohol product forms. Seeing a double bond to oxygen is not enough—you must identify the group.')
]
learn=[('An aldehyde becomes a primary alcohol.','Look for the carbon with both a double bond to O and a bond to H. That is the aldehyde site. NaBH₄ turns it into a primary alcohol: the carbon carrying OH is attached to just one other carbon.',reaction('aldehyde',4,cue=True)),('A ketone becomes a secondary alcohol.','Look for the carbon double-bonded to O with a carbon group on each side. That is a ketone. NaBH₄ turns it into a secondary alcohol: the carbon carrying OH stays attached to two other carbons.',reaction('ketone',3,cue=True))]
content='<header><p class="eyebrow">NO FEAR OCHEM · CHAPTER 17 · V2 — PEAKS CHECKED</p><h1>Same reaction.<br>Three ways to ask.</h1><p>Find the pattern. Make the move. Use it whichever part of the reaction is missing.</p></header><section><h2>1 · Learn these two pairs</h2><p><strong>Keep the condition with the fact:</strong> these patterns apply when NaBH₄ reduces an aldehyde or ketone. Other reagents can make those same starting groups react differently.</p>'
for title,para,drawing in learn:content+=f'<h3>{title}</h3><p>{para}</p><div class="scroll">{drawing}</div>'
content+='''<div class="note"><strong>The drawing move:</strong> change the double bond to oxygen into a single bond. Add H to oxygen and H to the same carbon. Keep every existing carbon–carbon connection.<br><br><strong>Where is the new H on carbon?</strong> Skeletal drawings usually leave it unwritten. It is still there. An unlabeled line end or corner represents carbon, with enough H to give carbon four bonds.</div><p class="small">Amber outlines mark the site that changes. They do not represent electron charge. Methanol is the solvent used in these examples.</p></section>'''
last=None
for q in questions:
 if q['group']!=last:content+=f'<h2 class="divider">{q["group"]}</h2>';last=q['group']
 kw=dict(kind=q['kind'],n=q['n'],large=q.get('large',False))
 prompt=reaction(**kw,missing=q['missing'])
 answer=reaction(**kw,cue=True)
 (P/f'{q["id"]}-answer.svg').write_text(answer)
 content+=f'<section class="question"><p class="eyebrow">{q["id"]}</p><h3>{q["title"]}</h3><div class="scroll">{prompt}</div><p class="instruction">Draw or decide on paper before revealing the answer.</p><details class="hint"><summary>Help me find the pattern</summary><p>{q["clue"]}</p></details><details class="answer"><summary>Show the skeletal answer</summary><div class="scroll">{answer}</div><p>{q["answer"]}</p></details></section>'
content+='''<section><h2>The check to carry into your next question</h2><ol><li>Find the carbon double-bonded to oxygen.</li><li>Check what else is attached to that carbon. Is it an aldehyde, a ketone, or another group?</li><li>Read the reagent. With NaBH₄ in these examples, aldehydes give primary alcohols and ketones give secondary alcohols.</li><li>Decide which part the question has hidden: product, reagent, or starting material.</li></ol><p><strong>One familiar reaction can answer all three formats.</strong></p></section><footer>Original teaching questions and skeletal drawings, created for this v1. The larger molecule is 4-(4-cyclohexylphenyl)butanal. The ketones were chosen with matching groups on both sides, so this first worksheet does not require a stereochemistry decision. Other ketones can produce mirror-image alcohols; that belongs in a later practice set. These examples do not establish a rule for every reagent or every group containing oxygen.</footer>'''
css='''*{box-sizing:border-box}body{margin:0;background:#f2f5f2;color:#23382f;font:18px/1.65 Arial,sans-serif}main{max-width:1060px;margin:auto;padding:30px}header{padding:35px;background:#183e32;color:#fff;border-radius:15px}h1{font-size:46px;line-height:1.15}h2{font-size:28px;line-height:1.3}h3{font-size:23px;line-height:1.35}.eyebrow{font-size:13px;font-weight:bold;letter-spacing:1px}section{padding:28px;background:white;border:1px solid #dce5de;border-radius:12px;margin:25px 0}.divider{margin-top:48px}.scroll{overflow-x:auto}svg{display:block;width:100%;min-width:740px;height:auto}.note{padding:20px;background:#fff8e8;border-left:4px solid #b87800}.small,footer,.instruction{font-size:14px;color:#5c6d62}details{padding:13px 17px;margin:12px 0;border:1px solid #ccd9cf;border-radius:8px}details.answer{background:#f0f6f1}summary{cursor:pointer;font-weight:bold}summary:focus-visible{outline:3px solid #b87800;outline-offset:4px}li{margin:10px 0}@media(max-width:650px){main{padding:12px}header,section{padding:18px}h1{font-size:34px}}@media print{body{background:white;font-size:11pt}main{padding:0}header{background:white;color:#23382f}section{break-inside:avoid}details>*{display:block!important}svg{min-width:0}footer{font-size:9pt}}'''
(P/'three-question-formats-v2-peaks-checked.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Same reaction, three question formats — v2 — peaks checked</title><style>'+css+'</style><main>'+content+'</main></html>')
(P/'question-data.json').write_text(json.dumps(questions,ensure_ascii=False,indent=2))
copy='# Same reaction, three question formats — editable copy\n\n'
for title,para,_ in learn:copy+=f'## {title}\n\n{para}\n\n'
for q in questions:copy+=f'## {q["id"]} — {q["title"]}\n\n**Hint:** {q["clue"]}\n\n**Answer explanation:** {q["answer"]}\n\n'
(P/'teaching-copy.md').write_text(copy)
for id in ['A1','K1','K2','A3','A4','B1','E1']:
 v=(P/f'{id}-answer.svg').read_bytes();doc=fitz.open(stream=v,filetype='svg');doc[0].get_pixmap(matrix=fitz.Matrix(1.15,1.15)).save(P/f'{id}-preview.png')
print('Created 10 original practice questions, 2 worked patterns, and skeletal answer reveals.')
