import xml.etree.ElementTree as ET
import random, string
import uuid
# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from merge_two_electric_boogaloo import prettify_xml

defaultImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAB4CAYAAAB1ovlvAAACqElEQVR4Xu3XMY7aUABF0e99QA/LAYkN0bAgEKuBjUBBRqSYYmaSKIWvZB3Xlp58/xHG0+vjGi4FogITgFF5s+8CAIKQFgAwzW8cQAbSAgCm+Y0DyEBaAMA0v3EAGUgLAJjmNw4gA2kBANP8xgFkIC0AYJrfOIAMpAUATPMbB5CBtACAaX7jADKQFgAwzW8cQAbSAgCm+Y0DyEBaAMA0v3EAGUgLAJjmNw4gA2kBANP8xgFkIC0AYJrfOIAMpAUATPMbB5CBtACAaX7jADKQFgAwzW8cQAbSAgCm+Y0DyEBaAMA0v3EAGUgLAJjmNw4gA2kBANP8xgFkIC0AYJrfOIAMpAUATPMbB5CBtACAaX7jADKQFgAwzW8cQAbSAgCm+Y0DyEBaAMA0v3EAGUgLAPhD/u12O47H4zgcDukBLX0cwD+c8H6/H6/X633H7XYb1+t1rNfrpZuY9fkA/Evu3W735Y5pmsbz+Rzn83nWw1riGID/CfDxeIzL5bJEE7M+E4D/+Aq+3+/vV/BqtZr1gJY+BuAPJ7zZbMbpdBrfvYKXjmLO5wNwztq2vv6f/vjK+/2Z51IgKOAXMIhu8rMAgDSkBQBM8xsHkIG0AIBpfuMAMpAWADDNbxxABtICAKb5jQPIQFoAwDS/cQAZSAsAmOY3DiADaQEA0/zGAWQgLQBgmt84gAykBQBM8xsHkIG0AIBpfuMAMpAWADDNbxxABtICAKb5jQPIQFoAwDS/cQAZSAsAmOY3DiADaQEA0/zGAWQgLQBgmt84gAykBQBM8xsHkIG0AIBpfuMAMpAWADDNbxxABtICAKb5jQPIQFoAwDS/cQAZSAsAmOY3DiADaQEA0/zGAWQgLQBgmt84gAykBQBM8xsHkIG0AIBpfuMAMpAWADDNb/wXK14Ct+2fpIIAAAAASUVORK5CYII='


class SnapStage:
    idCounter = 0
    
    def __init__(self):
        self.id = SnapStage.idCounter
        SnapStage.idCounter += 1
        
    def generate(self):
        stage = ET.Element('stage', {'name': 'Stage', 'width': '480', 'height': '360', 'costume': '0', 'color': '255,255,255,1', 'tempo': '60', 'threadsafe': 'false', 'penlog': 'false', 'volume': '100', 'pan': '0', 'lines': 'round', 'ternary': 'false', 'hyperops': 'true', 'codify': 'false', 'inheritance': 'true', 'sublistIDs': 'false', 'id': f"{self.id}"})
        ET.SubElement(stage, 'pentrails').text = fetchedImage
        costumes = ET.SubElement(stage, 'costumes')
        ET.SubElement(costumes, 'list', {'struct': 'atomic', 'id': '16'})
        sounds = ET.SubElement(stage, 'sounds')
        ET.SubElement(sounds, 'list', {'struct': 'atomic', 'id': '17'})
        ET.SubElement(stage, 'variables')
        ET.SubElement(stage, 'blocks')
        ET.SubElement(stage, 'scripts')
        sprites = ET.SubElement(stage, 'sprites', {'select': '1'})
        sprites.append(SnapSprite("testSprite").generate())
        return stage
    
class SnapSprite:
    idCounter = 0
    
    def __init__(self, name:str="def"):
        self.name = name
        self.id = SnapSprite.idCounter
        SnapSprite.idCounter += 1
        
    def generate(self):
        sprite = ET.Element('sprite', {'name': self.name, 'idx': f"{self.id}", 'x': '0', 'y': '0', 'heading': '90', 'scale': '1', 'volume': '100', 'pan': '0', 'rotation': '1', 'draggable': 'true', 'costume': '0', 'color': '80,80,80,1', 'pen': 'tip', 'id': f"{100+self.id}"})
        costumes_sprite = ET.SubElement(sprite, 'costumes')
        ET.SubElement(costumes_sprite, 'list', {'struct': 'atomic', 'id': '23'})
        sounds_sprite = ET.SubElement(sprite, 'sounds')
        ET.SubElement(sounds_sprite, 'list', {'struct': 'atomic', 'id': '24'})
        ET.SubElement(sprite, 'blocks')
        ET.SubElement(sprite, 'variables')
        scripts_sprite = ET.SubElement(sprite, 'scripts')
        scripts_sprite.append(SnapScript().generate())
        return sprite
    
class SnapScript:
    def __init__(self):
        self.x = random.randrange(0,300) + random.random()
        self.y = random.randrange(0,300) + random.random()
    
    def generate(self):
        script = ET.Element('script', {'x': str(self.x), 'y': str(self.y), 'customData': str(uuid.uuid4())})
        ET.SubElement(script, 'block', {'s':'receiveGo'})
        for i in range(random.randrange(0,5)):
            match(random.randrange(0,3)):
                case 0:
                    block = ET.SubElement(script, 'block', {'s':"forward"})
                    l = ET.SubElement(block, 'l')
                    l.text = str(random.randrange(5, 15))
                case 1:
                    block = ET.SubElement(script, 'block', {'s':"changeXPosition"})
                    l = ET.SubElement(block, 'l')
                    l.text = str(random.randrange(5, 15))
                case 2:
                    block = ET.SubElement(script, 'block', {'s':"changeYPosition"})
                    l = ET.SubElement(block, 'l')
                    l.text = str(random.randrange(5, 15))
        return script
    
    def alterPos(node: ET.Element):
        node.attrib["x"] = str(random.randrange(0,300) + random.random())
        node.attrib["y"] = str(random.randrange(0,300) + random.random())
        return node
    
    def alterBlocks(node: ET.Element):
        counter = 0
        for subNode in node:
            # skip receiveGo block
            if subNode.attrib["s"] == "receiveGo":
                continue
            if random.randrange(10) >= 7:
                counter += 1
                switchNodeState(subNode)
                
        # make sure at leas on change happend
        if counter == 0:
            # with no subnodes, add a fixed
            if len(node) <= 1:
                counter += 1
                block = ET.SubElement(node, 'block', {'s':"forward"})
                l = ET.SubElement(block, 'l')
                l.text = str(random.randrange(5, 15))
            else:
                counter += 1
                switchNodeState(node[1])
        return counter
    

def copyElement(elem):
    return ET.fromstring(ET.tostring(elem, encoding='utf-8').decode("utf-8")) 

def switchNodeState(subNode: ET.Element):
    match(subNode.attrib["s"]):
        case "forward":
            subNode[0].text = str(random.randrange(0,20))
        case "changeXPosition":
            subNode.attrib["s"] = "changeYPosition"
        case "changeYPosition":
            subNode.attrib["s"] = "changeXPosition"

    
        
        

class SnapScene:
    def __init__(self, name: str = "defaultName"):
        self.name = name
    
    def generate(self):
        scene = ET.Element('scene', {'name': self.name})
        ET.SubElement(scene, 'notes')
        ET.SubElement(scene, 'hidden')
        ET.SubElement(scene, 'headers')
        ET.SubElement(scene, 'code')
        blocks = ET.SubElement(scene, 'blocks')
        scene.append(SnapStage().generate())
        
        return scene

class SnapFileGenerator:
    """Can generate a snapfile with default values or specified fields
    """
    scenes:SnapScene = []
    
    def __init__(self,projectName:str = "", appName:str = "", version: int = 2):
        self.projectName = projectName
        self.appName = appName
        self.version = version
        
    def addScene(self, scene):
        self.scenes.append(scene)
        
    def generate(self):
        file, scenesNode = create_xml_head(self.projectName, self.appName, self.version)
        for s in self.scenes:
            scenesNode.append(s.generate())
        return file
    



def create_xml_head(projectName, versionName, version, asTree=False):
    project = ET.Element('project', {'name': projectName, 'app': versionName, 'version': f"{version}"})
    ET.SubElement(project, 'notes')
    ET.SubElement(project, 'thumbnail').text = defaultImage
    scenes = ET.SubElement(project, 'scenes', {'select': '1'})
    #scene = ET.SubElement(scenes, 'scene', {'name': projectName})
    if asTree:
        tree = ET.ElementTree(project)
        return treedecode
    return project, scenes


def create_snap_file(projectName, versionName):
    project, scene = create_xml_head(projectName, versionName)
    ET.SubElement(scene, 'notes')
    ET.SubElement(scene, 'hidden')
    ET.SubElement(scene, 'headers')
    ET.SubElement(scene, 'code')
    blocks = ET.SubElement(scene, 'blocks')
    # block_definition = ET.SubElement(blocks, 'block-definition', {'s': 'Post to smerge...', 'type': 'command', 'category': 'other'})
    # ET.SubElement(block_definition, 'header')
    # ET.SubElement(block_definition, 'code')
    # ET.SubElement(block_definition, 'translations').text = 'de:Poste auf smerge...'
    # ET.SubElement(block_definition, 'inputs')
    # script = ET.SubElement(block_definition, 'script')
    # block = ET.SubElement(script, 'block', {'s': 'doRun'})
    # block2 = ET.SubElement(block, 'block', {'s': 'reportJSFunction'})
    # ET.SubElement(block2, 'list')
    # ET.SubElement(block2, 'l').text = 'console.log("")'
    # ET.SubElement(block, 'list')
    
    stage = ET.SubElement(scene, 'stage', {'name': 'Stage', 'width': '480', 'height': '360', 'costume': '0', 'color': '255,255,255,1', 'tempo': '60', 'threadsafe': 'false', 'penlog': 'false', 'volume': '100', 'pan': '0', 'lines': 'round', 'ternary': 'false', 'hyperops': 'true', 'codify': 'false', 'inheritance': 'true', 'sublistIDs': 'false', 'id': '15'})
    ET.SubElement(stage, 'pentrails').text = 'data:image/png;base64,...'
    costumes = ET.SubElement(stage, 'costumes')
    ET.SubElement(costumes, 'list', {'struct': 'atomic', 'id': '16'})
    sounds = ET.SubElement(stage, 'sounds')
    ET.SubElement(sounds, 'list', {'struct': 'atomic', 'id': '17'})
    ET.SubElement(stage, 'variables')
    ET.SubElement(stage, 'blocks')
    ET.SubElement(stage, 'scripts')
    sprites = ET.SubElement(stage, 'sprites', {'select': '1'})
    sprite = ET.SubElement(sprites, 'sprite', {'name': 'Sprite', 'idx': '1', 'x': '0', 'y': '0', 'heading': '90', 'scale': '1', 'volume': '100', 'pan': '0', 'rotation': '1', 'draggable': 'true', 'costume': '0', 'color': '80,80,80,1', 'pen': 'tip', 'id': '22'})
    costumes_sprite = ET.SubElement(sprSnapSprite, {'struct': 'atomic', 'id': '24'})
    ET.SubElement(sprite, 'blocks')
    ET.SubElement(sprite, 'variables')
    scripts_sprite = ET.SubElement(sprite, 'scripts')
    # script1 = ET.SubElement(scripts_sprite, 'script', {'x': '222', 'y': '71.33333333333334', 'customData': '2nnk0aVP0cG2TyeQ'})
    # block1 = ET.SubElement(script1, 'block', {'s': 'receiveGo'})
    # block2 = ET.SubElement(script1, 'block', {'s': 'forward'})
    # ET.SubElement(block2, 'l').text = '10'
    # script2 = ET.SubElement(scripts_sprite, 'script', {'x': '83', 'y': '220.33333333333337', 'customData': 'iN0aYDEcJCssahrI'})
    # block3 = ET.SubElement(script2, 'block', {'s': 'receiveGo'})
    # ET.SubElement(script2, 'block', {'s': 'doSwitchToCostume'})
    # ET.SubElement(script2, 'l')

    # Continue creating the rest of the XML structure in a similar manner...

    # Finally, write the XML to a file
    tree = ET.ElementTree(project)
    return tree#, scripts_sprite<stage




def randomword(length):
   letters = string.ascii_letters + string.digits
   return ''.join(random.choice(letters) for i in range(length))

#import base64
#with open('noaa19-161015.png', 'rb') as fp, open('test.b64', 'w') as fp2:
#    base64.encode(fp, fp2)
import base64
import requests
def fetchRandomImageBase64():
    #https://robohash.org/laksdjf?set=set4&size=128x128
    
    randPart = randomword(10)

    # Fetch the PNG image data from a URL
    url = f"https://robohash.org/{randomword}?set=set4&size=128x128"
    response = requests.get(url)

    # Convert the image data to a base64 string)
    base64_image = base64.b64encode(response.content).decode('utf-8')
    
    base64_image = "data:image/png;base64," + base64_image

    return base64_image
    # with open("tmp_base_image.html", "w") as f:
    #     f.write(base64_image)

fetchedImage = fetchRandomImageBase64()

import xml.dom.minidom
def pretty_print_xml(xml_tree):
    parsed_xml = xml.dom.minidom.parseString(ET.tostring(xml_tree, encoding='utf-8').decode('utf-8'))
    pretty_xml_as_string = parsed_xml.toprettyxml(indent="  ")
    pretty_xml_as_string = pretty_xml_as_string.replace('<?xml version="1.0" ?>\n', '')
    return pretty_xml_as_string

if __name__ == '__main__':
    tmp = SnapFileGenerator(projectName="project", appName="Snap! 9.0, https://snap.berkeley.edu")
    tmp.addScene(SnapScene("test"))
    tmp.addScene(SnapScene("tes2"))
    projectName = "project"
    versionName = "Snap! 9.0, https://snap.berkeley.edu"
    # print(pretty_print_xml(create_snap_file(projectName, versionName).getroot()))
    with open("tmp_test.xml", "w") as f:
        f.write(pretty_print_xml(tmp.generate()))
    #print(pretty_print_xml(tmp.generate()))
    
    # print(random.randrange(0,300) + random.random())
    
    
    # print(fetchRandomImageBase64())