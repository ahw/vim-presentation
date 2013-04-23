import os
import re

for f in os.listdir(os.getcwd()):
    match = re.search("^\d+", f)
    if match:
        print f
