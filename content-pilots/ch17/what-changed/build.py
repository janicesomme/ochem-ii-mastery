from pathlib import Path
import json,re,html,xml.etree.ElementTree as ET
import fitz
from drawings import mol,line,text,INK
P=Path(__file__).parent

def molecule(kind,n=4,product=False,large=False,down=False,cue=False):
 raw=mol(kind,n,product,cue,large)
 if down:
  # Reflect geometry vertically, but keep atom labels upright.
  root=ET.fromstring('<g>'+raw+'</g>')
  for el in root:
   if el.tag=='line':
    for k in ['y1','y2']:el.set(k,str(280-float(el.get(k))))
   elif el.tag=='text':el.set('y',str(296-float(el.get('y'))))
   elif el.tag=='rect':el.set('y',str(280-float(el.get('y'))-float(el.get('height'))))
  raw=''.join(ET.tostring(el,encoding='unicode') for el in root)
 return raw

def reaction(spec,answer=False):
 kind=spec.get('kind','aldehyde');n=spec.get('n',4);reagent=spec.get('reagent','NaBH₄')
 kwargs=dict(kind=kind,n=n,large=spec.get('large',False),down=spec.get('down',False),cue=answer)
 left=molecule(**kwargs)
 is_lah=reagent=='LiAlH₄'
 labels=['1. LiAlH₄','2. H₂O'] if is_lah else ['NaBH₄','methanol']
 note=''
 if not answer:right=text(210,143,'?',54)
 elif kind=='ester' and is_lah:
  # Ester carbonyl side becomes an alcohol; methoxy side becomes methanol.
  right=molecule('aldehyde',n,True,cue=True)
  right+=text(350,140,'+',22)+line((370,145),(398,128))+text(415,131,'OH',21)
  note='Two alcohol pieces'
 else:
  right=molecule(**kwargs,product=True)
  if kind=='ester':note='No reaction: ester stays unchanged'
 arrow=line((442,140),(545,140))+f'<path d="M545 140 l-13 -7 v14 z" fill="{INK}"/>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1015 270" role="img" aria-label="{kind} with {reagent}; {"answer" if answer else "predict the change"}"><rect width="1015" height="270" fill="white"/>{left}<g transform="translate(570 0)">{right}</g>{arrow}{text(494,105,labels[0],20)}{text(494,180,labels[1],18)}{text(780,245,note,17)}</svg>'

pairs=[
 dict(id=1,title='A longer chain',a={'n':4},b={'n':6},verdict='Same reaction rule',noticed='B has a longer carbon chain. Both ends are still aldehydes, and both use NaBH₄.',why='An aldehyde has a carbon double-bonded to O and also bonded to H. NaBH₄ turns that end into a primary alcohol. The longer chain stays longer—you use the same move at its end.',carry='Check the reacting group before worrying about chain length. Same rule does not mean the two whole products are identical.'),
 dict(id=2,title='The drawing points the other way',a={'kind':'ketone','n':5},b={'kind':'ketone','n':5,'down':True},verdict='Same reaction rule—and the same molecule',noticed='B is the same structure turned over on the page. Its connections have not changed.',why='Both drawings show a ketone: the carbon double-bonded to O has a carbon group on each side. NaBH₄ gives the same secondary alcohol. Page direction does not change the reaction.',carry='Read the connections, not whether the oxygen points up or down. These plain bonds do not specify a different stereoisomer.'),
 dict(id=3,title='Two rings join the picture',a={'n':4},b={'n':4,'large':True},verdict='Same reaction rule',noticed='B has two rings attached to the chain. The reacting end is still an aldehyde.',why='NaBH₄ turns the aldehyde into a primary alcohol in both examples. The rings shown here stay unchanged. Keep the complete skeleton when drawing each product.',carry='A larger skeleton is not automatically a new reaction. Still scan its other groups before deciding they stay unchanged.'),
 dict(id=4,title='A different reagent name',a={'n':4},b={'n':4,'reagent':'LiAlH₄'},verdict='Same product here',noticed='A uses NaBH₄ in methanol. B uses LiAlH₄, followed by water.',why='Both sets of conditions reduce this aldehyde to the same primary alcohol. LiAlH₄ reacts with more types of groups, but this simple aldehyde gives the same product.',carry='These reagents are not interchangeable in every question. Decide what they do to the particular group in front of you. Never use methanol as the LiAlH₄ reaction solvent; the water step comes afterward.'),
 dict(id=5,title='Aldehyde or ketone?',a={'n':3},b={'kind':'ketone','n':5},verdict='Same bond-changing move; different alcohol type',noticed='A has H attached to the carbon double-bonded to O. B has carbon groups on both sides of that carbon.',why='NaBH₄ turns both into alcohols. The aldehyde gives a primary alcohol: its OH carbon has one carbon neighbor. The ketone gives a secondary alcohol: its OH carbon has two carbon neighbors.',carry='Use the same reduction move, but keep the carbon connections. They tell you which alcohol type you made.'),
 dict(id=6,title='One extra oxygen matters',a={'kind':'ketone','n':3},b={'kind':'ester','n':2},verdict='Different outcome: only A reacts',noticed='In B, the carbon double-bonded to O is also bonded to another O that joins a carbon group. That makes B an ester.',why='NaBH₄ turns A’s ketone into an alcohol. It leaves B’s ester unchanged under these conditions. Finding the double bond to oxygen is only the first check.',carry='Look at what else is attached to the carbon double-bonded to O. That extra oxygen changes which rule applies.'),
 dict(id=7,title='Now the reagent change matters',a={'kind':'ester','n':4},b={'kind':'ester','n':4,'reagent':'LiAlH₄'},verdict='Different outcome: only B reacts',noticed='The starting ester is identical. Only the reagent conditions change.',why='NaBH₄ leaves this ester unchanged. LiAlH₄, followed by water, turns it into two alcohol pieces. The carbonyl side becomes a primary alcohol; the oxygen-linked methyl piece becomes methanol.',carry='Pair the reagent with the starting group. The reagent swap made no product difference for the aldehyde in pair 4, but it makes a big difference for this ester.')
]
parts=['''<header><p class="eyebrow">NO FEAR OCHEM · CHAPTER 17 · VISUAL V1</p><h1>What changed?<br>Does it matter?</h1><p>Two drawings can look different and still use the same reaction rule. A small change can also change the answer.</p></header><section><h2>Your job</h2><ol><li>Compare A with B. Name what changed.</li><li>Decide whether you can use the same reaction move.</li><li>Predict each product, then reveal the drawings.</li></ol><p><strong>There is a middle answer:</strong> sometimes the bond-changing move stays the same, but the product type changes. Pair 5 shows this.</p><p class="small">These are original practice examples. Amber outlines in the answers mark the reacting group or the comparison group; they do not represent charge. All molecule structures are skeletal drawings. On a narrow screen, scroll the diagrams sideways.</p></section>''']
for p in pairs:
 parts.append(f'<section><p class="eyebrow">PAIR {p["id"]}</p><h2>{p["title"]}</h2>')
 for key in ['a','b']:parts.append(f'<h3>{key.upper()}</h3><div class="scroll">{reaction(p[key])}</div>')
 parts.append('<p><strong>Your call:</strong> what changed, and does it change the move? Say why before opening the answer.</p>')
 parts.append(f'<details><summary>Show the comparison and skeletal answers</summary><h3>{p["verdict"]}</h3><p><strong>What changed:</strong> {p["noticed"]}</p><p>{p["why"]}</p>')
 for key in ['a','b']:parts.append(f'<h3>{key.upper()} — answer</h3><div class="scroll">{reaction(p[key],True)}</div>')
 parts.append(f'<p class="takeaway"><strong>Use this next time:</strong> {p["carry"]}</p></details></section>')
parts.append('''<section><h2>Three checks to keep</h2><p><strong>What group is here?</strong> Look at the carbon double-bonded to oxygen and its neighbors.</p><p><strong>What does this reagent do to that group?</strong> A new reagent name may—or may not—change the product.</p><p><strong>Did only the picture change?</strong> A longer chain or a different orientation can leave the reaction rule unchanged.</p></section><footer>Starter for Janice’s teaching review. The symmetric ketones avoid a separate stereochemistry decision. These examples teach the stated conditions, not a universal rule for every reduction reagent. In skeletal drawings, most carbon-bound hydrogens are left unwritten.</footer>''')
css='''*{box-sizing:border-box}body{margin:0;background:#f2f5f2;color:#23382f;font:18px/1.65 Arial,sans-serif}main{max-width:1060px;margin:auto;padding:28px}header{background:#193f33;color:white;padding:35px;border-radius:14px}h1{font-size:44px;line-height:1.15}h2{font-size:27px;line-height:1.3}h3{font-size:21px;margin-bottom:0}section{margin:26px 0;padding:28px;background:white;border:1px solid #dce4dd;border-radius:12px}.eyebrow,.small,footer{font-size:14px}.eyebrow{font-weight:bold}.scroll{overflow-x:auto}svg{display:block;width:100%;min-width:780px;height:auto}details{background:#f2f7f2;padding:16px;border:1px solid #bccfbe;border-radius:8px}summary{font-weight:bold;cursor:pointer}summary:focus-visible{outline:3px solid #b87800}.takeaway{background:#fff7e4;padding:16px;border-left:4px solid #b87800}li{margin:8px 0}@media(max-width:650px){main{padding:12px}section,header{padding:18px}h1{font-size:33px}}'''
body=''.join(parts)
(P/'what-changed-v1.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>What changed? Does it matter? — v1</title><style>'+css+'</style><main>'+body+'</main></html>')
(P/'pairs.json').write_text(json.dumps(pairs,ensure_ascii=False,indent=2))
md='# What changed? Does it matter? — editable copy\n'
for p in pairs:md+=f'\n## Pair {p["id"]}: {p["title"]}\n\n**Answer:** {p["verdict"]}\n\n**What changed:** {p["noticed"]}\n\n{p["why"]}\n\n**Use this next time:** {p["carry"]}\n'
(P/'teaching-copy.md').write_text(md)
# Inspect every rendered question and answer, four panels per pair.
svgs=re.findall(r'<svg\b.*?</svg>',body,re.S);assert len(svgs)==28
for i in range(7):
 blocks=[]
 for j,v in enumerate(svgs[i*4:i*4+4]):
  inner=re.sub(r'^<svg[^>]*>','',v).removesuffix('</svg>')
  blocks.append(f'<g transform="translate(0 {j*300})">{text(130,24,["A prompt","B prompt","A answer","B answer"][j],20)}<g transform="translate(0 28)">{inner}</g></g>')
 sheet='<svg xmlns="http://www.w3.org/2000/svg" width="1015" height="1200">'+''.join(blocks)+'</svg>'
 doc=fitz.open(stream=sheet.encode(),filetype='svg');doc[0].get_pixmap(matrix=fitz.Matrix(.8,.8)).save(P/f'pair-{i+1}-review.png')
print('7 pairs; 28 complete/partial reaction panels; 7 native answer reveals.')
