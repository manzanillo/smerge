import asyncio
from pyppeteer import launch
import time

async def run_js():
    browser = await launch(ignoreHTTPSErrors=True)
    page = await browser.newPage()
    
    page.on('console', lambda msg: print(msg.text))
    
    await page.goto('file:///home/rs-kubuntu/Desktop/Snap-master/snap.html#open:https://rs-kubuntu.local/blockerXML/171.xml')
    time.sleep(0.1)
    #result = await page.evaluate('console.log(this.world.worldCanvas.baseURI);')  # Replace 'yourFunction()' with your JS function
    result = await page.evaluate('var ide = this.parentThatIsA(IDE_Morph);ide.saveCanvasAs(this.object.fullImage(),this.object.name);')
    print(result)
    await browser.close()

asyncio.get_event_loop().run_until_complete(run_js())
