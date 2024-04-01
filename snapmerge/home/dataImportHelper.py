import html
import sys

def make_xml_safe(input_str):
    return html.escape(input_str, quote=False).replace('\n', '&#xD;')

def generateDataImportXML():
    with open("snapmerge/static/snap/data_importer.js", 'r') as f:
        content = f.read()
    saveContent = make_xml_safe(content)
    with open("snapmerge/static/snap/data_importer_blank.xml", 'r') as f:
        blankFile = f.read()
    with open("snapmerge/static/snap/data_importer.xml", 'w') as f:
        f.write(blankFile.replace("{{js_code}}", saveContent))
    
    