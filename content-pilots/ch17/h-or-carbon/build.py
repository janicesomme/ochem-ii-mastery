from pathlib import Path
import html,json,re,xml.etree.ElementTree as ET
import fitz
from drawings import mol,line,text,INK
P=Path(__file__).parent
AMBER='#b87800'
def product(n,mode,large=False,cue=False):
 if mode=='H':return mol('aldehyde',n,True,cue,large)
 # Carbonyl carbon retains its skeleton coordinates and becomes an alcohol carbon.
 # The new methyl is an unlabeled endpoint on a downward-sloping bond.
 cx,cy=(346,140) if large else (205+(n-1)*21,117)
 s=mol('aldehyde',n,True,False,large)
 if cue:s+=f'<rect x="{cx-24}" y="{cy-70}" width="85" height="108" rx="12" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 s+=line((cx,cy),(cx+42,cy+23),3.6,AMBER if cue else INK)
 assert cy+23>cy,'Incoming carbon bond must point down from the peak'
 return s

def rxn(n=3,mode='H',missing=None,large=False,cue=False):
 lhs=text(205,141,'?',53) if missing=='start' else mol('aldehyde',n,False,cue,large)
 rhs=text(205,141,'?',53) if missing=='product' else product(n,mode,large,cue)
 reagent,finish=('NaBH₄','methanol') if mode=='H' else ('1. CH₃MgBr','2. H₂O')
 if missing=='reagent':reagent,finish='?',''
 arrow=line((442,140),(545,140))+f'<path d="M545 140 l-13 -7 v14 z" fill="{INK}"/>'
 note=''
 if missing!='product' and mode=='C':note='New carbon: the end of the added bond' if cue else ''
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1015 255" role="img" aria-label="Aldehyde: {"hydrogen addition" if mode=="H" else "methyl addition"}; {missing or "complete reaction"}"><rect width="1015" height="255" fill="white"/>{lhs}<g transform="translate(570 0)">{rhs}</g>{arrow}{text(494,105,reagent,21)}{text(494,181,finish,18)}{text(786,235,note,16)}</svg>'

qs=[
 dict(id='1',group='2 · Repeat: add H',n=3,mode='H',missing='product',prompt='Draw the product connections.',hint='Find the aldehyde end. Does NaBH₄ bring in any carbon?',answer='No new carbon is added. Change the double bond to oxygen into a single bond and add H to oxygen and to the same carbon. Keep the three-carbon skeleton.'),
 dict(id='2',group='2 · Repeat: add H',n=4,mode='H',missing='product',prompt='Same move, one more time.',hint='The chain is longer. Is the reacting end still an aldehyde?',answer='Yes. NaBH₄ still gives a primary alcohol. Keep all four carbons; add no new carbon.'),
 dict(id='3',group='3 · Repeat: add a carbon group',n=2,mode='C',missing='product',prompt='Draw the product connections.',hint='CH₃MgBr supplies a methyl group: one carbon. Attach it to the carbon double-bonded to oxygen.',answer='Add a new bond from the aldehyde carbon to a new line end. That new end is the added methyl carbon. After water, the oxygen is OH. The product has three carbons.'),
 dict(id='4',group='3 · Repeat: add a carbon group',n=3,mode='C',missing='product',prompt='Same addition, a longer starting chain.',hint='Keep the original three-carbon chain. Where does the extra methyl carbon join?',answer='It joins the carbon that was double-bonded to oxygen. After water, that carbon carries OH. You now have four carbons altogether.'),
 dict(id='5H',group='4 · Compare the same starting molecule',n=4,mode='H',missing='product',prompt='A: NaBH₄. Draw the product connections.',hint='This is the H-adding route. Count the carbons before drawing.',answer='Four carbons before, four after. The aldehyde becomes a primary alcohol.'),
 dict(id='5C',group='4 · Compare the same starting molecule',n=4,mode='C',missing='product',prompt='B: CH₃MgBr, then water. Draw the product connections.',hint='This is the carbon-adding route. Keep the four original carbons and attach one more at the aldehyde carbon.',answer='Four carbons before, five after. The new methyl bond is amber in the answer. The aldehyde becomes a secondary alcohol because its OH carbon now has two carbon neighbors.'),
 dict(id='6',group='5 · Change what the question asks',n=3,mode='H',missing='reagent',prompt='Which of our two reagent choices gives this change?',hint='Compare the carbon skeletons. Did a new carbon appear?',answer='Choose NaBH₄ in methanol from our two choices. The carbon count stays the same. Other suitable reducing reagents exist, but CH₃MgBr would add a carbon.'),
 dict(id='7',group='5 · Change what the question asks',n=3,mode='C',missing='reagent',prompt='Which of our two reagent choices gives this change?',hint='The product has a new one-carbon branch at the OH carbon. Which reagent brings that carbon?',answer='Choose CH₃MgBr, followed by water. Its methyl carbon makes the new carbon–carbon bond. NaBH₄ cannot supply that extra carbon.'),
 dict(id='8',group='5 · Change what the question asks',n=4,mode='H',missing='start',prompt='Draw the aldehyde that gives this product.',hint='Undo the H-adding move. Keep the carbon skeleton.',answer='Restore the aldehyde at the alcohol end. No carbon needs to be removed because NaBH₄ added only hydrogen.'),
 dict(id='9',group='5 · Change what the question asks',n=4,mode='C',missing='start',prompt='Draw the aldehyde that gives this product with CH₃MgBr.',hint='Find the OH carbon. The one-carbon branch attached directly to it came from CH₃MgBr.',answer='Remove that methyl branch and restore the aldehyde at the same carbon. The other end methyl is farther away: do not remove it. The starting aldehyde has four carbons.'),
 dict(id='10',group='6 · Find the move without highlights',n=4,mode='C',missing='product',large=True,prompt='A bigger molecule. Draw the product connections.',hint='Find the carbon double-bonded to O and bonded to H. Attach the methyl there; keep the rings and chain.',answer='The added methyl joins the aldehyde carbon at the far right. After water, that carbon carries OH. Both rings and the connecting chain remain unchanged in this example.')
]
body='''<header><p class="eyebrow">NO FEAR OCHEM · CHAPTER 17 · V1</p><h1>Add H—or add a carbon group?</h1><p>Same starting site. Two different moves. Read the reagent before you draw.</p></header><section><h2>1 · Learn the difference</h2><p>Both reactions below start from the <strong>same aldehyde</strong>. Find the carbon with a double bond to O and a bond to H.</p><h3>NaBH₄: no new carbon</h3><p>NaBH₄ turns this aldehyde into a primary alcohol. Change the double bond to oxygen into a single bond. Add H to oxygen and to that same carbon.</p>'''+'<div class="scroll">'+rxn(2,'H',cue=True)+'</div>'+ '''<p><strong>Carbon check:</strong> two before, two after.</p><h3>CH₃MgBr, then water: add one carbon</h3><p>CH₃MgBr is a <strong>Grignard reagent</strong>: it supplies a carbon group that can join the aldehyde carbon. Here that group is methyl—one carbon.</p>'''+'<div class="scroll">'+rxn(2,'C',cue=True)+'</div>'+ '''<p>Draw a new bond from the aldehyde carbon to a new line end. After the water step, its oxygen is OH. The amber bond shows where the new carbon joined.</p><p><strong>Carbon check:</strong> two before, three after.</p><div class="note"><strong>The difference to remember:</strong> NaBH₄ adds H at this carbon. CH₃MgBr adds a methyl group at this carbon. Both routes end with an alcohol, but only one adds carbon.</div><p class="small">An unlabeled line end is carbon. Most H atoms on carbon are left unwritten. Amber marks the changed site or new bond; it does not represent charge.</p></section>'''
last=None
for q in qs:
 if q['group']!=last:body+=f'<h2 class="divider">{q["group"]}</h2>';last=q['group']
 kw=dict(n=q['n'],mode=q['mode'],large=q.get('large',False))
 body+=f'<section><p class="eyebrow">QUESTION {q["id"]}</p><h3>{q["prompt"]}</h3><div class="scroll">{rxn(**kw,missing=q["missing"])}</div><p class="small">Decide on paper before opening the answer.</p><details><summary>Help me find the move</summary><p>{q["hint"]}</p></details><details class="answer"><summary>Show the skeletal answer</summary><div class="scroll">{rxn(**kw,cue=True)}</div><p>{q["answer"]}</p></details></section>'
body+='''<section><h2>Carry this into the next question</h2><ol><li><strong>Find the aldehyde.</strong> Its carbon is double-bonded to O and also bonded to H.</li><li><strong>Read the reagent.</strong> Does it supply H, or a carbon group?</li><li><strong>Check the product’s carbon count.</strong> NaBH₄ adds no carbon. CH₃MgBr adds one methyl carbon.</li></ol><p>The drawings can change, and the question can hide a different piece. You still make the same decision.</p><details><summary>Two boundaries to keep with this rule</summary><p>These examples use aldehydes. Esters and other starting groups need their own rules.</p><p>In a Grignard reaction, water comes after the carbon-adding step. Water or an exposed OH group can use up the Grignard reagent before it joins the aldehyde. The Grignard steps here assume dry ether conditions before the water step.</p></details><details><summary>What about wedges and dashes?</summary><p>This first sheet asks for the product’s connections. When the methyl addition creates a carbon with four different groups, these conditions give an equal mixture of two mirror-image alcohols. The plain skeleton shows their shared connections. If a question asks for stereochemistry, draw both forms. The two-carbon aldehyde example gives matching methyl groups, so it does not create that stereocenter.</p></details></section><footer>Original teaching drawings and questions for Janice’s review. Upward O/OH groups sit at outward peaks; the new methyl bond slopes down and away. Starting and product skeletons use matching coordinates. This is a starter for recognizing reaction choices, not a complete Grignard chapter.</footer>'''
css='''*{box-sizing:border-box}body{margin:0;background:#f2f5f2;color:#23382f;font:18px/1.65 Arial,sans-serif}main{max-width:1060px;margin:auto;padding:28px}header{background:#193f33;color:white;padding:34px;border-radius:14px}h1{font-size:42px;line-height:1.15}h2{font-size:27px;line-height:1.3}h3{font-size:22px}.divider{margin-top:42px}section{padding:28px;background:white;border:1px solid #dce4dd;border-radius:12px;margin:24px 0}.eyebrow,.small,footer{font-size:14px}.eyebrow{font-weight:bold}.scroll{overflow-x:auto}svg{display:block;width:100%;min-width:780px;height:auto}details{border:1px solid #c9d8ca;padding:14px;border-radius:8px;margin:12px 0}.answer{background:#f1f7f2}summary{cursor:pointer;font-weight:bold}summary:focus-visible{outline:3px solid #b87800}.note{background:#fff7e4;border-left:4px solid #b87800;padding:18px}li{margin:9px 0}@media(max-width:650px){main{padding:12px}section,header{padding:18px}h1{font-size:33px}}'''
(P/'add-h-or-carbon-v1.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Add H or a carbon group — v1</title><style>'+css+'</style><main>'+body+'</main></html>')
(P/'questions.json').write_text(json.dumps(qs,ensure_ascii=False,indent=2))
md='# Add H—or add a carbon group?\n\nNaBH₄ adds no carbon. CH₃MgBr adds one methyl carbon to these aldehydes, followed by water to give the alcohol.\n'
for q in qs:md+=f'\n## {q["id"]}: {q["prompt"]}\n\n**Hint:** {q["hint"]}\n\n**Answer:** {q["answer"]}\n'
(P/'teaching-copy.md').write_text(md)
svgs=re.findall(r'<svg\b.*?</svg>',body,re.S);assert len(svgs)==24
for offset in range(0,24,4):
 blocks=[]
 for j,v in enumerate(svgs[offset:offset+4]):
  inner=re.sub(r'^<svg[^>]*>','',v).removesuffix('</svg>')
  blocks.append(f'<g transform="translate(0 {j*285})">{text(130,23,"Panel "+str(offset+j+1)+" of 24",18)}<g transform="translate(0 26)">{inner}</g></g>')
 svg='<svg xmlns="http://www.w3.org/2000/svg" width="1015" height="1140">'+''.join(blocks)+'</svg>'
 d=fitz.open(stream=svg.encode(),filetype='svg');d[0].get_pixmap(matrix=fitz.Matrix(.85,.85)).save(P/f'review-{offset//4+1}.png')
print('11 questions, 2 worked reactions, 24 skeletal panels created.')
