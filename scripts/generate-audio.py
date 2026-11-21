# Optional cloud-generated narration. Run only if approved for your study.
import asyncio, json, subprocess, tempfile, wave
from pathlib import Path
import edge_tts
root=Path(__file__).resolve().parent.parent
subprocess.run(['node',str(root/'scripts/generate-audio.mjs')],check=True)
tracks=json.loads((root/'scripts/audio-script.json').read_text())
voices={'host':'en-US-JennyNeural','guest':'en-US-GuyNeural'}
async def main():
    destination=root/'public/audio'; destination.mkdir(parents=True,exist_ok=True)
    timings=[]
    with tempfile.TemporaryDirectory() as tmp:
        tmp=Path(tmp)
        for i,track in enumerate(tracks,1):
            files=[]
            cues=[]
            elapsed=0.0
            for j,line in enumerate(track):
                mp3=tmp/f'{i}-{j}.mp3'; wav=tmp/f'{i}-{j}.wav'
                await edge_tts.Communicate(line['text'],voices[line['speaker']],rate='-5%').save(str(mp3))
                subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(mp3),'-af',f"apad=pad_dur={line['pause']/1000}",'-ar','44100','-ac','1',str(wav)],check=True)
                with wave.open(str(wav),'rb') as audio:
                    duration=audio.getnframes()/audio.getframerate()
                cues.append({'text':line['text'],'start':elapsed,'end':elapsed+duration})
                elapsed+=duration
                files.append(wav)
            listing=tmp/'concat.txt'; listing.write_text('\n'.join(f"file '{f}'" for f in files))
            subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-codec:a','libmp3lame','-q:a','3',str(destination/f'section-{i}.mp3')],check=True)
            timings.append(cues)
            print(f'Completed section {i}',flush=True)
    (destination/'transcript-timings.json').write_text(json.dumps(timings))
    (root/'src/data/recordedAudio.json').write_text('true\n')
asyncio.run(main())
