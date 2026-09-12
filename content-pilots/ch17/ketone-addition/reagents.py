from pathlib import Path
import re,json,html,fitz
from drawings import mol,line,text,INK
P=Path(__file__).parent
AMBER='#b87800'
def incoming(size,cue=False):
 if size==1:
  s=text(73,124,'CH₃',23)+line((101,117),(139,117))+text(171,124,'MgBr',23)
  if cue:s+=f'<ellipse cx="73" cy="116" rx="25" ry="18" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 else:
  s=line((58,118),(100,95))+line((100,95),(139,117))+text(171,126,'MgBr',23)
  if cue:s+=f'<circle cx="100" cy="95" r="12" fill="none" stroke="{AMBER}" stroke-width="2"/>'
 return s
