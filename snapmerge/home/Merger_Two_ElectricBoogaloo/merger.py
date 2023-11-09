import xml.etree.ElementTree as ET
import re

from .generator import *
from enum import Enum


tmp1_file_path = "add_new.xml"
tmp2_file_path = "moved.xml"

import xml.dom.minidom
def pretty_print_xml(xml_tree):
    parsed_xml = xml.dom.minidom.parseString(ET.tostring(xml_tree, encoding='utf-8').decode('utf-8'))
    pretty_xml_as_string = parsed_xml.toprettyxml(indent="  ")
    return re.sub(r'\n\s*\n+', '\n', pretty_xml_as_string.replace('<?xml version="1.0" ?>\n',""))
    #.replace('<?xml version="1.0" ?>\n',"")
    #re.sub(r'\s*\n\s*', '\n', 
def nodeToReadable(node: ET.Element):
    attribs = ' '.join([(f'{key}="{value}"') for (key, value) in node.attrib.items()])
    return f"<{node.tag}{' ' if attribs != '' else ''}{attribs}>"


class Conflict:
    def __init__(self, leftElement, rightElement, conflictType="Element"):
        self.leftElement = leftElement
        self.rightElement = rightElement
        if conflictType not in ["Element", "Text", "Image"]:
            raise ValueError("Invalid conflictType. It must be one of 'Element', 'Text', or 'Image'.")
        self.conflictType = conflictType
        
    def __str__(self):
        return f"Conflict ({self.conflictType}): {self.leftElement} <-> {self.rightElement}"
    
    def toFile(self, leftFilePath, rightFilePath):
        if self.conflictType == "Element":
            projectName = "View"
            versionName = "Snap! 9.0, https://snap.berkeley.edu"
            file1, test = create_snap_file(projectName, versionName)
            test.append(self.leftElement)
            
            with open(leftFilePath, "w") as f:
                f.write(pretty_print_xml(file1.getroot()))
            
            file2, test2 = create_snap_file(projectName, versionName)
            test2.append(self.rightElement)
            with open(rightFilePath, "w") as f:
                f.write(pretty_print_xml(file2.getroot()))
        else:
            with open(leftFilePath, "w") as f:
                f.write(self.leftElement)
            with open(rightFilePath, "w") as f:
                f.write(self.rightElement)

class Step(Enum):
    LEFT = 1
    RIGHT = 2
    DATA = 3

class Resolution:
    """Resolution contains information to resolve a conflict. Steps can be "left", "right" or "data"
    """
    def __init__(self, step: Step, additionalData: str=""):
        self.step = step
        self.additionalData = additionalData
        
    def resolve(self, leftElement, rightElement):
        match self.step:
            case Step.LEFT:
                return leftElement
            case Step.RIGHT:
                return rightElement
            case _:
                return self.additionalData
        


def merge(file1Path: str, file2Path: str, resolutions: list[Resolution]=[]) -> tuple[list[Conflict], str]:
    """Main merging function

    Parameters
    ----------
    file1Path : str
        Path to left xml File.
    file2Path : str
        Path to right xml File.
    resolutions : list[Resolution]
        List of resolutions

    Returns
    -------
    tuple[list[Conflict], str]
        returns conflicts and merged if conflicts is None, the merge should have worked, otherwise return conflicts
    """
    
    
    conflicts = []
    
    treeLeft = ET.parse(file1Path)
    treeRight = ET.parse(file2Path)
    
    leftRoot = treeLeft.getroot()
    rightRoot = treeRight.getroot()
    
    # Merge project definition
    defConflict, merged = mergeDoc(leftRoot,rightRoot, resolutions)
    
    if defConflict:
        conflicts.append(defConflict)
        
    # Merge simple till scenes
    for i in range(len(leftRoot)):
        if leftRoot[i].tag != "scenes":
            simConflict, _ = mergeSimple(leftRoot[i], rightRoot[i])
            if simConflict:
                for con in simConflict:
                    conflicts.append(con)
        scenesConflicts = mergeScenes(leftRoot[i], rightRoot[i])
        if scenesConflicts:
            for con in scenesConflicts:
                conflicts.append(con)
    
    # if no conflicts were found during merge, save the file, otherwise handle conflicts
    if len(conflicts) > 0:
        return conflicts, None
    print("Save merged xml")
    return None, ET.tostring(leftRoot, encoding="UTF-8")
    
    # tmp function store...
    #     mother_sprite = tree1.find(".//sprites")
    # sprites1 = tree1.getroot().findall(".//sprite")
    # sprites2 = tree2.getroot().findall(".//sprite")
    
    
def getResolution(resolutions):
    if len(resolutions) > 0:
        return resolutions.pop(0)
    return None

def compareVersionName(leftNodeText, rightNodeText):
    pattern = r"(([0-9]+\.)*[0-9]+)+"
    matchesLeft = re.findall(pattern, leftNodeText)
    matchesRight = re.findall(pattern, rightNodeText)
    if matchesLeft:
        if matchesRight:
            partsLeft = matchesLeft[0][0].split('.')
            partsRight = matchesRight[0][0].split('.')

            # Compare each pair of components
            for c1, c2 in zip(partsLeft, partsRight):
                if int(c1) > int(c2):
                    return 1
                elif int(c1) < int(c2):
                    return -1
            # If we haven't returned yet, the versions are equal up to the length of the shorter one
            # If one version has more components than the other, it's considered greater
            # If they have the same number of components, they're equal
            if len(partsLeft) > len(partsRight):
                return 1
            elif len(partsLeft) < len(partsRight):
                return -1
            else:
                return 0
        else:
            return 1
    if matchesRight:
        return -1
    return 0

# merge both projects definitions, check if name has changed and return text conflict in case
# in addition chose newest version
def mergeDoc(leftNode, rightNode, resolutions=[]):
    # if project names mismatch, add conflict
    if leftNode.attrib['name'] != rightNode.attrib['name']:
        tmpRes = getResolution(resolutions)
        if tmpRes:
            return None, tmpRes.resolve(leftNode, rightNode)
        return Conflict(leftNode.attrib['name'], rightNode.attrib['name'], conflictType="Text"), leftNode
    
    # if the right version is higher, chose that one, otherwise use the left
    if compareVersionName(leftNode.attrib['app'], rightNode.attrib['app']) == -1:
        return None, rightNode
    return None, leftNode



# if node is in list and exact the same, 1
# if in list by definition, 2
# if not at all, 0
def containsNode(nodeList, nodeToFind, onlyCheck=""):
    for node in nodeList:
        if (compareNodesSame(node, nodeToFind, onlyCheck)):
            return 1
    for node in nodeList:
        if (compareNodesDefinition(node, nodeToFind, onlyCheck)):
            return 2
    return 0


# Checks only if tag, attributes and text are the same
def compareNodesDefinition(leftNode, rightNode, onlyCheck=""):
    if leftNode.tag != rightNode.tag:
        return False
    
    if onlyCheck != "":
        if onlyCheck in leftNode.keys() and onlyCheck in rightNode.keys():
            if leftNode.attrib[onlyCheck] != rightNode.attrib[onlyCheck]:
                return False
    else:
        if leftNode.keys() != rightNode.keys():
            return False
    
    if leftNode.text and rightNode.text:
        if leftNode.text != rightNode.text:
            return False
        
    if (leftNode.text is None and rightNode.text is not None) or (leftNode.text is not None and rightNode.text is None):
        return False
    
    if onlyCheck == "":
        for i in range(len(leftNode.attrib)):
            if leftNode.attrib[leftNode.keys()[i]] != rightNode.attrib[rightNode.keys()[i]]:
                return False
    return True


# reccursifly compares two nodes and return true if they are the same and false if they differ
def compareNodesSame(leftNode, rightNode, onlyCheck=""):
    # Break case, if leaf and same, ret true
    if isAtomic(leftNode) and isAtomic(rightNode):
        conflict, _ = atomicMerge(leftNode, rightNode)
        return conflict == None
            
    # If one is not atomic, they differ return false
    if isAtomic(leftNode) != isAtomic(rightNode):
        return False
    if len(leftNode) != len(rightNode):
        return False
    if(not compareNodesDefinition(leftNode, rightNode, onlyCheck)):
        return False
    
    res = True
    for (l, r) in zip(leftNode, rightNode):
        res = res and compareNodesSame(l, r)
    return res


# expects left and right node have same definition and values, only child nodes differ
def mergeSimple(leftNode: ET.Element, rightNode: ET.Element, resolutions:list[Resolution]=[]) -> tuple[list[Conflict], ET.Element]:
    """Simply merges two nodes 

    Parameters
    ----------
    leftNode : ET.Element
        _description_
    rightNode : ET.Element
        _description_
    resolutions : list[Resolution], optional
        _description_, by default []

    Returns
    -------
    tuple[list[Conflict], ET.Element]
        _description_
    """
    leftNodeList = [n for n in leftNode]
    retConflicts = []
    
    # post to smerge ignore hotfix...
    if leftNode.tag == "block-definition":
        print(leftNode)
        try:
            s = leftNode.get("s")
            if "" in s:
                return None, leftNode
        except:
            pass
    
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode)
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictNode = getNodeMatchByDef(leftNodeList, rNode)
            
            if(leftNode.tag == "thumbnail"):
                retConflicts.append(Conflict(conflictNode.text, rNode.text, conflictType="Image"))
            elif ("script" not in leftNode.tag):
                retConflicts.append(Conflict(pretty_print_xml(conflictNode), pretty_print_xml(rNode), conflictType="Text"))
            else:
                retConflicts.append(Conflict(conflictNode, rNode))
    
    if len(leftNodeList) == 0:
        if not compareNodesSame(leftNode, rightNode, onlyCheck=""):
            if(leftNode.tag == "thumbnail"):
                retConflicts.append(Conflict(leftNode.text, rightNode.text, conflictType="Image"))
            elif ("script" not in leftNode.tag):
                retConflicts.append(Conflict(pretty_print_xml(leftNode), pretty_print_xml(rightNode), conflictType="Text"))
            else:
                retConflicts.append(Conflict(leftNode, rightNode))
            
    if len(retConflicts) != 0:
        return retConflicts, None
    return None, leftNode




# merge the smallest leaf if they are exact the same, conflict otherwise
def atomicMerge(leftNode, rightNode):
    if leftNode.tag != rightNode.tag:
        return Conflict(leftNode, rightNode), None
    if leftNode.text != rightNode.text:
        return Conflict(leftNode, rightNode), None
    if len(leftNode.attrib) != len(rightNode.attrib):
        return Conflict(leftNode, rightNode), None
    leftKeys = leftNode.keys()
    rightKeys = rightNode.keys()
    for i in range(min(len(leftNode.attrib),len(rightNode.attrib))):
        v1 = leftNode.attrib[leftKeys[i]]
        v2 = rightNode.attrib[rightKeys[i]]
        if leftKeys[i] != rightKeys[i]:
            return Conflict(leftNode, rightNode), None
        if v1 != v2:
            return Conflict(leftNode, rightNode), None
    return None, leftNode

# checks if a node is a leaf (the smallest element)
def isAtomic(node):
    return len(node) == 0

# old... ignore?
    # merge a simple xml structure together by adding all differences and merging the same
    #def simpleMerge(leftNode, rightNode):
        # if isAtomic(leftNode) and isAtomic(rightNode):
        #     atomicConf, merged = atomicMerge(leftNode, rightNode)
        # # todo check if different element, if yes smash
        # leftNodeChildren = [t for t in leftNode]
        # rightNodeChildren = [t for t in rightNode]
        # if len(leftNode) > 0 and len(rightNode) > 0:
        # todo check same elements with atomic merger
        # resolve rest... profit
        
        # if definition is different, a conflict occurred
        # if not compareNodesDefinition(leftNode, rightNode):
        #     return Conflict(leftNode, rightNode), None
        
        # # add all subnodes of the rightNode to the left if they are different or the same
        # # if they are the same 
        # for rSub in rightNode:
            
        # return None, None

    # def getNodeDiff(leftNode, rightNode):
    #     # return all nodes that are different from each other
    #     leftNodeChildren = [t for t in leftNode]
    #     rightNodeChildren = [t for t in rightNode]
        






    


    retConflicts = []
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode)
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictingLeftNode = getNodeMatchByDef(leftNodeList, rNode)
            
            sceneConflicts = mergeScene(conflictingLeftNode, rNode)
            if sceneConflicts:
                for con in sceneConflicts:
                    retConflicts.append(con)
            #retConflicts.append(Conflict(leftNode, rNode))
    return retConflicts


def getNodeMatchByDef(nodeList, node, onlyCheck=""):
    for n in nodeList:
        if compareNodesDefinition(n, node, onlyCheck):
            return n
        

def mergeScene(leftNode, rightNode):
    conflicts = []
    for i in range(len(leftNode)):
        # catch specials
        if leftNode[i].tag == "blocks":
            conflicts = conflicts + mergeBlocks(leftNode[i], rightNode[i])
            continue
        if leftNode[i].tag == "stage":
            simConflict = mergeStage(leftNode[i], rightNode[i])
            if simConflict:
                conflicts = conflicts + simConflict
            continue
        
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    return conflicts


# currently only simple merge, needs to be added
# todo
def mergeBlocks(leftNode, rightNode):
    simConflict, merged = mergeSimple(leftNode, rightNode)
    # if simConflict:
    #     return simConflict
    return []


def mergeStage(leftNode, rightNode):
    conflicts = []
    for i in range(len(leftNode)):
        if leftNode[i].tag == "blocks":
            conflicts = conflicts + mergeBlocks(leftNode[i], rightNode[i])
            continue
            
        if leftNode[i].tag == "scripts":
            simConflict = mergeScripts(leftNode[i], rightNode[i])
            conflicts = conflicts + simConflict
            continue
        
        if leftNode[i].tag == "sprites":
            conflicts = conflicts + mergeSprites(leftNode[i], rightNode[i])
            continue
            
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    return conflicts


def mergeSprites(leftNode, rightNode):
    leftNodeList = [n for n in leftNode]
    retConflicts = []
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode, onlyCheck="id")
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictingLeftNode = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="id")
            confs = mergeSprite(conflictingLeftNode, rNode)
            retConflicts = retConflicts + confs
    return retConflicts


def mergeSprite(leftNode, rightNode):
    conflicts = []
    for i in range(len(leftNode)):
        if leftNode[i].tag == "blocks":
            conflicts = conflicts + mergeBlocks(leftNode[i], rightNode[i])
            continue
            
        if leftNode[i].tag == "scripts":
            simConflict = mergeScripts(leftNode[i], rightNode[i])
            conflicts = conflicts + simConflict
            continue
            
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    return conflicts


def mergeScripts(leftNode, rightNode):
    leftNodeList = [n for n in leftNode]
    retConflicts = []
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode, onlyCheck="customData")
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictingLeftNode = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="customData")
            retConflicts.append(Conflict(conflictingLeftNode, rNode))
    return retConflicts
        

conflicts = []

if __name__ == '__main__':
    # tagLeft = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
    # tagLeft = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
    # ET.SubElement(tagLeft, "test", {'v': '1'})
    # ET.SubElement(tagLeft, "test2", {'s': '2'})
    # ET.SubElement(tagLeft, "test3")
    # ET.SubElement(tagLeft, "test4", {'s': '2'})
    
    # tagRight = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
    # ET.SubElement(tagRight, "test", {'v': '1'})
    # ET.SubElement(tagRight, "test2", {'s': '2'})
    # ET.SubElement(tagRight, "test3")
    # ET.SubElement(tagRight, "test4")
    # ET.SubElement(tagRight, "test5")
    
    #tagLeft= ET.fromstring('<list><l>ux</l><l>uy</l><l>d1</l><l>d2</l><l>d3</l><l>n1</l><l>n2</l><l>tx</l><l>ty</l><l>tz</l><l>w</l></list>')
    #tagRight= ET.fromstring('<list><l>ux</l><l a="1">uy</l><l>d1</l><l>d2</l><l>d3</l><l>n1</l><l>n2</l><l>tx</l><l>ty</l><l>tz</l><l>w</l></list>')
    
    
    # nodeLeft = ET.parse("Tests/Data/script1.xml").getroot()
    # nodeRight = ET.parse("Tests/Data/script2.xml").getroot()
    
    # conflicts = mergeScripts(nodeLeft, nodeRight)
    # res = nodeLeft
    
    
    
    conflicts, res = merge("moved.xml", "export.xml")
    if conflicts:
        for c in conflicts:
            print(pretty_print_xml(c.leftElement))
            print("<-->")
            print(pretty_print_xml(c.rightElement))
            c.toFile("./","test")
        # print([str(c) for c in conflicts])
    if res:
        print(pretty_print_xml(res))
    
    
    
    
    
    
        
    # ret= pretty_print_xml(tagLeft)
    # print(ret)
    
    
    # conflict, merged = atomicMerge(tagLeft, tagRight)
    # print(conflict, "conflict")
    # tree1 = ET.parse(tmp1_file_path)
    # tree2 = ET.parse(tmp2_file_path)
    
    # merge(tmp1_file_path, tmp2_file_path)
    # print(isAtomic(tagRight))
    
    # print(compareVersionName("Snap! 9.12.2, https://snap.berkeley.edu","Snap! 9.12.22, https://snap.berkeley.edu"))
    
    # s = "Snap! 9.12.1, https://snap.berkeley.edu"

    # # Your regex pattern
    # pattern = r"(([0-9]+\.)*[0-9]+)+"

    # # Find matches
    # matches = re.findall(pattern, s)

    # # Print matches
    # for match in matches:
    #     print(match)