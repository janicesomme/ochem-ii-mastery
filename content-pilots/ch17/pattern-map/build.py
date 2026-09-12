from pathlib import Path
import json,re,html
P=Path(__file__).parent
source_path=P.parent/'ch17-eoc-friendly-explanations.json'
if not source_path.exists(): source_path=P.parent/'eoc-explanations'/'ch17-eoc-friendly-explanations.json'
source=json.loads(source_path.read_text())
# Editorial grouping, not a claim that all groups are final app tools.
rows=[
('P1','Choose the site that reacts','Find each C=O and check what is attached to its carbon. Also look for OH and C=C.','Match the reagent to each group before changing any bonds. “No reaction” is a valid result.','A model, a line drawing, or a large molecule can contain the same reactive group.','An ester is not a ketone. An extra OH can destroy a Grignard reagent; a nearby C=C can create another reaction site.','17.35A(a) → 17.41(a) → 17.42(a)','Same NaBH₄ decision, with more surrounding structure. Compare 17.35B(a), where the ester stays unchanged.'),
('P2','Turn an aldehyde or ketone into an alcohol','Look for an aldehyde or ketone and a reducing reagent such as NaBH₄.','Change C=O to C–OH. Add H to that same carbon.','The C=O may sit at a chain end, inside a ring, or on a large skeleton.','This drawing move does not cover esters or amides. H₂/Pd may also change C=C under the stated conditions.','17.37(a) → 17.37(b) → 17.35A(a)','Repeat the aldehyde reduction with another reagent; then notice that a ketone gives a secondary alcohol.'),
('P3','Reduce an ester, acid, or amide','Look for C=O bonded to O or N, then check the hydride reagent.','With LiAlH₄, an ester or acid carbonyl end becomes CH₂OH. An amide C=O becomes CH₂ while its C–N bond stays. A nitrile, C≡N, becomes CH₂NH₂.','An ester link may be hidden inside a ring or connect two large pieces.','An ester can split into alcohol pieces; an amide follows a different bond pattern. The bulky reagent in 17.41(d) stops an acid chloride at an aldehyde.','17.35B(b) → 17.41(b) → 17.55','Repeat ester reduction, then open two ester links. Use 17.41(c) to contrast the amide rule.'),
('P4','Turn an alcohol into C=O—or an aldehyde into COOH','Find OH or CHO and identify the oxidizing reagent.','A secondary alcohol becomes a ketone. PCC changes a primary alcohol to an aldehyde; the aqueous strong oxidizing mixture can continue to COOH.','The same change may be a single product question or a middle step in synthesis.','PCC, the silver reagent, and dichromate do not change the same set of groups. Count the carbon neighbors of the OH carbon.','17.37(e) → 17.37(f) → 17.42(c–e)','Repeat aldehyde oxidation, then compare which additional OH groups change.'),
('P5','Add one carbon group at C=O','Find an aldehyde or ketone and the carbon carrying MgBr, Li, or a negative charge.','Bond that incoming carbon to the C=O carbon. Turn the oxygen into OH after the finishing water step.','The incoming piece can be methyl, phenyl, an alkyne, or a larger chain. C=O can be in a ring.','Use the carbon that carries the metal or charge. Do not add at a nearby C=C when the specified reagent instead adds at C=O.','17.37(g) → 17.37(h) → 17.37(j–k)','Repeat the same joining move with differently drawn carbon pieces. Then try the ring ketone in 17.43(b).'),
('P6','An ester or acid chloride can take two carbon groups','Find an ester or acid chloride and excess Grignard or organolithium reagent.','Remove the ester’s singly bonded OR piece, or the acid chloride’s Cl. Add two copies of the incoming carbon group at its C=O carbon, which ends with OH.','The ester may be attached to a ring or occur as one site in a larger structure.','A ketone takes one group. A cuprate with an acid chloride stops at a ketone. The tether in 17.52 makes the second addition close a ring. The special conditions in 17.54 require separate treatment.','17.35B(c) → 17.43(d) → 17.70','Repeat the two-addition pattern, then recognize it from spectra. Contrast 17.35A(c).'),
('P7','Add at the far end of C=O–C=C','Spot C=O–C=C and check for the cuprate reagent in these problems.','Add the incoming group at the far alkene carbon. Make the original C=C single and keep C=O after the finishing step.','This connected pattern can be in a ring, a chain, or a molecule with another double bond.','Grignard and organolithium reagents in the paired examples add at C=O instead. Keep any double bond in the incoming vinyl group.','17.38(c) → 17.43(e) → 17.40(f)','Repeat with ring and chain; then distinguish the original double bond from the incoming one.'),
('P8','Open the little oxygen ring','Find the three-membered epoxide ring and compare its two carbons.','For these basic carbon reagents, attach at the less crowded carbon and break that carbon’s bond to O. O stays on the other carbon and becomes OH. In 17.73, use the reverse connection pattern to close an epoxide from O⁻ and a neighboring C–Cl site.','The epoxide may be on a straight chain, a ring, or a fused-ring structure.','The new group comes from the opposite side of the broken C–O bond. If the two ends are equivalent, check whether they still give different 3D products.','17.38(d) → 17.43(f) → 17.45(b)','Repeat ring opening, then make the opposite-face requirement explicit. Reverse the move in 17.61.'),
('P9','Cover OH, do the carbon chemistry, uncover OH','Look for an OH that must survive a strong carbon reagent.','Replace the OH hydrogen with a protecting group. Do the needed reaction, then remove the cover to recover OH.','OH may be far from the bond you are trying to make. It still affects reagent compatibility.','An exposed OH can use up the Grignard reagent. A permanent ether in the target is not a temporary protecting group.','17.37(l) → 17.48 → 17.66(a)','Learn the covering move, then use it to prevent a failed reaction and to build an alkyne.'),
('P10','Choose how many carbons to add','Compare the starting skeleton with the target. Count the new carbons.','A Grignard plus formaldehyde adds one carbon ending in OH. Ethylene oxide adds two ending in OH. CO₂ adds one ending in COOH.','The original piece may be straight, branched, aromatic, or cyclic.','These three partners do not add the same number of carbons or give the same end group.','17.36(c) → 17.49F → 17.63(a)','Repeat the one-carbon OH extension. Contrast the two-carbon extension in 17.36(d) and COOH extension in 17.43(a).'),
('P11','Choose the face, not just the connection','Check wedges, dashes, existing stereocenters, and any face-selective reagent.','First make the correct connections. Then decide which side receives the new bond and which existing orientations stay.','The same product connection can require a mirror-image pair, several relative arrangements, or one favored face.','CBS reagent labels do not give a universal opposite R/S product label. Existing groups and bridges can make the faces different.','17.39(a) → 17.39(b–c) → 17.47','Compare equal-face addition with a favored face; then use crowding to choose the approach.'),
('P12','Work backward from the target','Find the target’s OH carbon, N-adjacent carbon, or new carbon–carbon bond.','Undo a known forward move: cut the added carbon group away and restore the carbonyl or epoxide starting pattern. Then check the forward reaction.','The question may ask for starting materials, several routes, or a full synthesis from restricted ingredients.','An ester route needs two matching added groups. A ring bond cannot always be cut into two separate starting molecules. Starting-material restrictions still apply.','17.57(a) → 17.57(b) → 17.59','Repeat backward carbonyl cuts; then impose the matching-pair requirement for an ester route.'),
('S1','Connect the main moves with earlier reactions','Look for a necessary change such as OH to Br, Br to MgBr, alkene to epoxide, or alcohol to alkene.','Use the earlier reaction that prepares the next step. Keep track of every intermediate. Also retain the specific rule from 17.38(a): a cuprate replaces acid-chloride Cl with one carbon group and stops at a ketone.','These moves are often buried inside a long synthesis rather than asked alone.','Ring substitution position, carbon count, protecting groups, and reagent order can decide whether a route works.','17.49H–J → 17.63(a) → 17.64(b)','Repeat OH-to-Grignard preparation, then check why aromatic bromination must come later.'),
('S2','Use the product to guide electron arrows','Mark the bond that must form or break, then find the electron pair that can make that change.','Start each curved arrow at a bond or lone pair. Point it to the atom or bond receiving that pair, and check charges afterward.','An addition may be followed by ester opening, another addition, ring closing, or proton transfer.','Knowing the product does not replace the intermediate steps. Do not draw an arrow starting at a positive charge.','17.51 → 17.53 → 17.55','Repeat addition and ester opening with different reagents. Then see a new ring close in 17.52.'),
('S3','Use spectra to check a proposed structure','First use the reagent and formula to suggest a product. Then inspect the stated IR and NMR clues.','IR helps identify groups such as C=O or OH. NMR signal sizes and splitting help check which H environments the structure contains.','Two compounds can have the same mass but different groups. Symmetry can make a large structure give few signals.','Mass alone does not identify a structure. An OH peak is not a reliable substitute for counting H attached to the OH-bearing carbon.','17.49 F/G/K comparison → 17.69 → 17.70','Repeat the check of H near OH, then use symmetry and integration. 17.71–72 add less familiar reaction clues.'),
('S4','Use another electron arrangement to find a reactive site','Look for a charged carbon next to a double bond or a C=O–C=C system.','Draw another allowed electron arrangement without moving the atoms. Use it to locate a reactive or electron-poor carbon.','This can explain a reaction at an unexpected carbon or a larger NMR shift farther from oxygen.','Resonance drawings are not separate molecules that take turns existing. Check charges and carbon’s bond count.','17.75 → 17.77','Use the same electron-delocalization idea for a spectrum explanation and for an unexpected bond-forming site. These are different tasks, not identical practice.'),
('S5','Recognize a special pathway before using the usual shortcut','Look for the unfamiliar starting group, unusual product, or special conditions in the prompt.','Use the specific intermediate shown by the solution to connect the starting group to the product.','Examples include a nitrile becoming a ketone, an amide ending without oxygen, or one-addition ester conditions.','Do not force every carbon reagent plus C=O into “finish with an alcohol.” Keep these exceptions attached to their question and conditions.','17.54; 17.71; 17.72; 17.77–79','These need separate mini-cards. They are not one interchangeable reaction family.')
]
patterns={r[0]:dict(zip(['id','title','notice','move','appearance','meaningful_change','practice','practice_reason'],r)) for r in rows}
# Tags represent moves needed in each task, not mutually exclusive bins.
default={35:'P1',36:'P12 P5 P10 S1',37:'P1',38:'P1',39:'P2 P11',40:'P1',41:'P1',42:'P1',43:'P1',44:'P4 P5 S1',45:'P11',46:'P8 P11 S1',47:'P2 P11',48:'P9 P5 S1',49:'S1',50:'S1',51:'P5 P6 S2',52:'P6 P5 S2',53:'P6 S2',54:'S5 S2',55:'P3 S2',56:'P3 P12',57:'P5 P12',58:'P5 P12',59:'P6 P12',60:'P5 P12',61:'P8 P12 P11',62:'S1',63:'P12 S1',64:'P12 P5 P4 S1',65:'P12 S1',66:'P12 P9 P5 S1',67:'P12 P7 P5 S1',68:'P12 P9 P4 P11 S1',69:'P2 S3',70:'P6 S3',71:'S3 S5',72:'S3 S4 S5',73:'P5 P8 S2',74:'P12 P2 P3 P9 P11 S1',75:'S3 S4',76:'P5 P3 S2',77:'S4 S5 S2',78:'P7 S2 S5',79:'S2 S5'}
overrides={
35:['P1 P2','P1 P2','P1 P5','P1 P5','P1 P4','P1','P1 P3','P1 P6','P1 P6','P1 P4'],
36:['P12 P5 P4 S1','P12 P5 P4 S1','P12 P5 P10 P4 S1','P12 P8 P10 S1'],
37:['P1 P2','P1 P2','P1 P2','P1 P4','P1 P4','P1 P4','P1 P5','P1 P5','P1','P1 P5','P1 P5','P9'],
38:['P1 S1','P1','P1 P7','P1 P8'],
40:['P1 P2','P1 S1','P1 P2 S1','P1 P5','P1 P5','P1 P7'],
41:['P1 P2','P1 P2 P3','P1 P3','P1 P3'],
42:['P1 P2','P1 P2 P3','P1 P4','P1 P4','P1 P4'],
43:['P10','P5','P6','P6','P7','P8'],
45:['P5 P11','P8 P11','P2 P11','P3 P11'],
49:['P5','S1','S1','S1','S1','P10 S1','P8','P2','S1','S1','P5','S3'],
50:['P2 P11','S1','S1','S1 P11'],
60:['P5 P12','P5 P12','P5 P12','P5 P12','P6 P12'],
61:['P8 P10 P12','P8 P11 P12','P8 P11 P12'],
63:['P12 P10 S1','P12 P8 P4 S1','P12 P5 P4 S1','P12 P10 P5 P4 S1'],
65:['P12 P5 P4 S1','P12 P5 P10 P4 S1','P12 P5 P4 S1'],
76:['P5 S2','P5 S2','P3'],
77:['P5 P10 S2','S4 S5 S2','S4 S5 S2']}
entries=[]
for q in source['questions']:
    n=int(q['number'].split('.')[1]);b=q['explanation_markdown']
    parts=re.findall(r'^- \*\*(.+?):\*\* (.+)$',b,re.M)
    if not parts:parts=[('Whole question',b.split('*Source check:')[0].strip())]
    tags=overrides.get(n,[default[n]]*len(parts))
    assert len(parts)==len(tags),(n,len(parts),len(tags))
    src=re.search(r'\*Source check: (.+?)\*',b).group(1)
    for (label,explain),ts in zip(parts,tags):
        ids=ts.split();assert all(x in patterns for x in ids)
        entries.append({'question':q['number'],'part':label,'patterns':ids,'source':src})
assert set(x['question'] for x in entries)=={'17.'+str(n) for n in range(35,80)}
for pat in patterns.values():
    pat['references']=[e['question']+' '+e['part'] for e in entries if pat['id'] in e['patterns']]
    assert pat['references']
intro='''# Chapter 17 — Patterns Behind the Questions

**Starter map for Janice • Smith EOC 17.35–17.79 • Teaching wording still open for editing**

The goal is to help a student ask: **“Which familiar move is this question asking me to use?”**

This draft proposes **12 teaching groups**, plus **5 supporting skill groups**. These are an editorial starting point, not a proven minimum toolkit. Several groups work together in longer questions. The index maps every question and the separately identified parts in the companion draft; it is not a count of independent skills or of final products to draw.

**What you see first:** the reacting group, the reagent, and any nearby group that can change the outcome. A larger molecule can use the same move, but its extra groups must be checked before treating them as background.

**Common trap:** treating every C=O the same. What is attached to its carbon—and which reagent is present—decides the move.

**Quick check:** would NaBH₄ change both the ketone and the ester in 17.41(a)? Answer: the ketone changes; the ester stays. The matching C=O shape is not the whole decision.

## The proposed teaching groups

| Group | What the student learns to do |
|---|---|
'''
md=intro+'\n'.join(f'| {r[0]} | {r[1]} |' for r in rows)+'\n\n## Pattern cards\n'
for r in rows:
    a=patterns[r[0]]
    md+=f"\n### {a['id']} — {a['title']}\n\n**Notice first:** {a['notice']}\n\n**The move:** {a['move']}\n\n**Different appearance:** {a['appearance']}\n\n**A difference that matters:** {a['meaningful_change']}\n\n**Starter practice sequence:** {a['practice']}\n\n{a['practice_reason']}\n\n**Mapped EOC references:** "+'; '.join(a['references'])+'.\n'
md+='''
## What this suggests we build first

1. **One reusable decision guide:** use P1 to choose which sites react, then link to the relevant move. This comes before hiding parts of a large molecule.
2. **Three high-value contrasts:** ketone versus ester; direct C=O addition versus far-end addition; unprotected OH versus protected OH. Each pair changes one important decision.
3. **Repeated practice:** take two or three existing examples of the same move before introducing the contrast. The sequences above are proposed selections from Smith, not newly invented questions.
4. **A separate layer for face and mechanism:** after the student knows the product connections, add the P11 face check or S2 arrow steps when the question requires them.
5. **Small exception cards:** keep 17.54 and 17.71–79 accessible without teaching their special pathways as universal rules.

## Every-question index

A row can have several tags because a synthesis combines moves. Whole-question rows cover unlettered mechanisms and sequences. The comparison row in 17.49 covers the NMR distinction among F, G, and K. Ranges inside labels preserve the task divisions of the companion draft.

| Question | Part or task | Needed groups | Source reference |
|---|---|---|---|
'''
for e in entries:md+=f"| {e['question']} | {e['part']} | {', '.join(e['patterns'])} | {e['source']} |\n"
md+='''
## Scope and review notes

Based on the uploaded Smith chapter 17 question and solutions PDFs and the preceding source-checked EOC companion draft. The solutions remain the main guide. Page numbers in the index distinguish the manual’s printed chapter-page labels from the question PDF’s file-page numbers. No new cross-textbook match has been asserted.

Coverage checks confirm 45 consecutive parent questions and one tag assignment for every separately identified entry in the companion. Multi-step tasks have overlapping tags. This does not prove that students can answer everything using these cards alone: earlier reaction knowledge, product drawing, complete mechanisms, and spectroscopy skills are still needed where indicated.

The grouping and practice order are teaching proposals for review. No student trial has yet established their effectiveness. The No Fear rewrite and changes to the app remain paused.
'''
(P/'ch17-pattern-map.md').write_text(md)
(P/'ch17-pattern-map.json').write_text(json.dumps({'status':'starter for editorial review','patterns':list(patterns.values()),'question_index':entries},ensure_ascii=False,indent=2))
# Render Markdown as a self-contained reading document.
def fmt(t):
 t=html.escape(t)
 return re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',t)
blocks=[];table=False
for line in md.splitlines():
 if line.startswith('|'):
  if re.match(r'^\|[- |]+$',line):continue
  cells=line.strip('|').split('|')
  if not table:blocks.append('<table>');table=True;tag='th'
  else:tag='td'
  blocks.append('<tr>'+''.join('<'+tag+'>'+fmt(c.strip())+'</'+tag+'>' for c in cells)+'</tr>')
  continue
 if table:blocks.append('</table>');table=False
 if not line:continue
 m=re.match(r'^(#{1,3}) (.*)',line)
 if m:blocks.append('<h'+str(len(m[1]))+'>'+fmt(m[2])+'</h'+str(len(m[1]))+'>')
 else:blocks.append('<p>'+fmt(line)+'</p>')
if table:blocks.append('</table>')
body=''.join(blocks)
css='body{font:17px/1.6 system-ui,sans-serif;color:#233236;background:#f3f6f4;margin:0}main{max-width:1080px;margin:auto;padding:36px;background:white}h1,h2,h3{color:#175b56;line-height:1.3}h2{margin-top:2em;border-top:2px solid #dce7e3;padding-top:1em}h3{margin-top:2em}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #d5e1dc;padding:9px;text-align:left;vertical-align:top}th{background:#eaf2ee}tr:nth-child(even){background:#f7faf8}li{margin:.7em 0}@media print{body{font-size:11pt}main{padding:0}h3{break-after:avoid}tr{break-inside:avoid}}'
(P/'ch17-pattern-map.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chapter 17 Pattern Map</title><style>'+css+'</style><main>'+body+'</main></html>')
print(json.dumps({'parent_questions':45,'indexed_entries':len(entries),'teaching_groups':12,'supporting_groups':5,'coverage_check':'pass'}))
