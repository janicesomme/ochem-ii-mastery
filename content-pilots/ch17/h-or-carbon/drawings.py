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
