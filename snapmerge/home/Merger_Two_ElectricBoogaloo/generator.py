import xml.etree.ElementTree as ET
# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from merge_two_electric_boogaloo import prettify_xml

def create_xml_head(projectName, versionName, asTree=False):
    project = ET.Element('project', {'name': projectName, 'app': versionName, 'version': '2'})
    ET.SubElement(project, 'notes')
    ET.SubElement(project, 'thumbnail').text = 'data:image/png;base64,...'
    scenes = ET.SubElement(project, 'scenes', {'select': '1'})
    scene = ET.SubElement(scenes, 'scene', {'name': projectName})
    if asTree:
        tree = ET.ElementTree(project)
        return tree
    return project, scene


def create_xml(projectName, versionName):
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
    costumes_sprite = ET.SubElement(sprite, 'costumes')
    ET.SubElement(costumes_sprite, 'list', {'struct': 'atomic', 'id': '23'})
    sounds_sprite = ET.SubElement(sprite, 'sounds')
    ET.SubElement(sounds_sprite, 'list', {'struct': 'atomic', 'id': '24'})
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
    return tree, scripts_sprite

import xml.dom.minidom
def pretty_print_xml(xml_tree):
    parsed_xml = xml.dom.minidom.parseString(ET.tostring(xml_tree, encoding='utf-8').decode('utf-8'))
    pretty_xml_as_string = parsed_xml.toprettyxml(indent="  ")
    return pretty_xml_as_string

if __name__ == '__main__':
    projectName = "project"
    versionName = "Snap! 9.0, https://snap.berkeley.edu"
    print(pretty_print_xml(create_xml(projectName, versionName).getroot()))