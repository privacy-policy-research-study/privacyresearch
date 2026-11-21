from pathlib import Path
import shutil, subprocess
root=Path(__file__).resolve().parent.parent
app=root/'src/App.jsx'; original=app.read_text()
if 'window.location.search' not in original: raise SystemExit('App.jsx does not have the expected study-mode expression; no files changed.')
try:
    for mode in ('audio','verify','visual','original'):
        app.write_text(original.replace('window.location.search',f'"?mode={mode}"',1))
        subprocess.run(['npm','run','build','--',f'--base=/privacy-{mode}/'],cwd=root,check=True)
        dest=root/'github-websites'/mode
        if dest.exists(): shutil.rmtree(dest)
        shutil.copytree(root/'dist',dest)
        print(f'Built {dest}',flush=True)
finally: app.write_text(original)
