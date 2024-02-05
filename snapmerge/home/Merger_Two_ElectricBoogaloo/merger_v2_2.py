import xml.etree.ElementTree as ET
import re

# from .generator import *
from enum import Enum


tmp1_file_path = "add_new.xml"
tmp2_file_path = "moved.xml"

# python merger_v2_2.py

import xml.dom.minidom
def pretty_print_xml(xml_tree):
    parsed_xml = xml.dom.minidom.parseString(ET.tostring(xml_tree, encoding='utf-8').decode('utf-8'))
    pretty_xml_as_string = parsed_xml.toprettyxml(indent="  ")
    return re.sub(r'\n\s*\n+', '\n', pretty_xml_as_string.replace('<?xml version="1.0" ?>\n',""))
    #.replace('<?xml version="1.0" ?>\n',"")
    #re.sub(r'\s*\n\s*', '\n', 
    
def nodeToString(xmlNode: ET.Element, level = 0, indent="  ") -> str:
    if len(xmlNode) == 0:
        return (indent * level) + cap_string(nodeToReadable(xmlNode))
    ret = (indent * (level)) + cap_string(nodeToReadable(xmlNode)) + "\n"
    for i, child in enumerate(xmlNode):
        ret += f"{nodeToString(child, level+1)}"+'\n'
    ret += f"{indent * (level)}</{xmlNode.tag}>"
    return ret
    
def nodeToReadable(node: ET.Element):
    attribs = ' '.join([(f'{key}="{value}"') for (key, value) in node.attrib.items()])
    return f"<{node.tag}{' ' if attribs != '' else ''}{attribs}>"

def cap_string(input_string, max_length=50):
    if len(input_string) <= max_length:
        return input_string
    else:
        return input_string[:max_length] + '...'


class Conflict:
    def __init__(self, leftElement, rightElement, conflictType="Element", s="", category=""):
        self.leftElement = leftElement
        self.rightElement = rightElement
        if conflictType not in ["Element", "Text", "Image", "CustomBlock"]:
            raise ValueError("Invalid conflictType. It must be one of 'Element', 'Text', or 'Image'.")
        self.conflictType = conflictType
        self.s = s
        self.category = category
        
    def __str__(self):
        return f"Conflict ({self.conflictType}): {self.leftElement} <-> {self.rightElement}"
    
    def toFile(self, leftFilePath, rightFilePath):
        if self.conflictType == "Element" or self.conflictType == "CustomBlock":
            projectName = "view"
            versionName = "Snap! 9.0, https://snap.berkeley.edu"
            file1, test, blocks = create_snap_file(projectName, versionName)
            test.append(self.leftElement)
            
            
            if self.conflictType == "CustomBlock":
                firstElem = self.leftElement[0]
                if 'custom-block' in firstElem.tag:
                    for block in blocks:
                        block.append(SnapCustomBlock(s = self.s, category=self.category).generate())
            
            with open(leftFilePath, "w") as f:
                f.write(pretty_print_xml(file1.getroot()))
            
            file2, test2, blocks = create_snap_file(projectName, versionName)
            test2.append(self.rightElement)
            
            if self.conflictType == "CustomBlock":
                firstElem = self.rightElement[0]
                if 'custom-block' in firstElem.tag:
                    for block in blocks:
                        block.append(SnapCustomBlock(s = self.s, category=self.category).generate())
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
        


# new basic concept
# load two files as xml tree
# get list of resolution and propagate to all sub function (default empty)
# create empty third, which will be the return tree filled with the needed content in the end
#   - could merge all into left or right, but will break stuff with palets and other different node structures... therefore working copy
# 
# For each xml step zip all same tags together and run merge for each tag type on zips, copy unzipped straight to working copy since they are unique
# Each sub merger will only return a bool if the merge was successful or not
#   - since the working copy is an instance object, it only needs to be passed down, not back up gain... same with the conflict list



# -------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------- UTILITY FUNCTIONS ---------------------------------------------------------
# -------------------------------------------------------------------------------------------------------------------------------------

def zipMatchingNodesByTag(leftRoot: ET.Element, rightRoot: ET.Element) -> tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:
    """Only use on layers with unique tag types, not inside a costume for example!
    Combines nodes with the same tag from both sides and returns a zipped list.
    Unique tagged nodes are returned in a separate list.

    Parameters
    ----------
    leftRoot : ET.Element
        Element tree parent node for the left side
    rightRoot : ET.Element
        Element tree parent node for the left side

    Returns
    -------
    tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:\n
            1. List of ET.Element zips with matching tag
            2. Unique tag elements
    -------
    """
    leftList = [x for x in leftRoot]
    rightList = [x for x in rightRoot]
    retZips = []
    retUniques = []
    
    for leftNode in leftList:
        foundNode = findNodeByTag(leftNode, rightList)
        if foundNode != None:
            retZips.append((leftNode, foundNode))
            rightList.remove(foundNode)
        else:
            retUniques.append(leftNode)
    for restNode in rightList:
        retUniques.append(restNode)
        
    return retZips, retUniques
   
def findNodeByTag(targetNode: ET.Element, searchNodeList: list[ET.Element]) -> ET.Element | None:
    """Returns the first matching node from the list or None

    Parameters
    ----------
    targetNode : ET.Element
        Single node to be matched by tag
    searchNodeList : list[ET.Element]
        List of nodes to be searched

    Returns
    -------
    ET.Element | None:
        Returns the node
    -------
    """
    for sNode in searchNodeList:
        if sNode.tag == targetNode.tag:
            return sNode
    return None

def shallowCopyNode(node: ET.Element) -> ET.Element:
    """Create a shallow copy of an ET node

    Parameters
    ----------
    node : ET.Element
        Node to be copied

    Returns
    -------
    ET.Element:
        Node without children
    -------
    """
    return ET.Element(node.tag, attrib=node.attrib)

def getResolution(resolutions: list[Resolution]) -> Resolution | None:
    """'Save' pop the first element of the given list

    Parameters
    ----------
    resolutions : list[Resolution]
        List of resolutions

    Returns
    -------
    Resolution | None :
        Returns the top element of the list and removes it from the original | None if list is empty
    -------
    """
    if len(resolutions) > 0:
        return resolutions.pop(0)
    return None

def compareVersionName(leftNodeText: str, rightNodeText: str) -> int:
    """Compare app version number

    Parameters
    ----------
    leftNodeText : str
        String of left app version
    rightNodeText : str
        String of right app version

    Returns
    -------
    int : 
        0 if both are the same | 1 if the left is higher | -1 if the right is higher
    -------
    """
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


# -------------------------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------  MERGE FUNCTIONS  ---------------------------------------------------------
# -------------------------------------------------------------------------------------------------------------------------------------

def merge2(leftFilePath: str, rightFilePath: str, resolutions: list[Resolution])-> tuple[list[Conflict] | None, str]:
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
    tuple[list[Conflict] | None, str]
        returns None and merged string if there are no conflicts, otherwise return conflicts and None
    -------
    """
    treeLeft = ET.parse(leftFilePath)
    treeRight = ET.parse(rightFilePath)
    
    leftRoot = treeLeft.getroot()
    rightRoot = treeRight.getroot()
    
    conflicts = []
    workCopy = ET.Element("")
    
    # Merge Project Definitions
    if mergeProjectDef(leftRoot, rightRoot, workCopy, conflicts, resolutions):
        # only done the first time to init the working copy with the base node
        workCopy = workCopy[0]
    
    # Merge children
    # Merge scenes
    # Merge others
    
    return None, ET.tostring(workCopy, encoding="UTF-8")

def mergeProjectDef(leftNode: ET.Element, rightNode: ET.Element, workCopy:ET.Element, conflicts: list[Conflict], resolutions: list[Resolution]) -> bool:
    """Merger for the project definition node type\n
    Checks name and project version (newer version will be chosen)

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    workCopy : ET.Element
        Replaces with shallow copy of merged node
    conflicts : list[Conflict]
        Resulting conflicts will be pushed into this list
    resolutions : list[Resolution], optional
        List of resolutions

    Returns
    -------
    bool : 
        Returns if merge was successful or not
    -------
    """
    if leftNode.attrib['name'] != rightNode.attrib['name']:
        tmpRes = getResolution(resolutions)
        if tmpRes:
            workCopy.append(shallowCopyNode(tmpRes.resolve(leftNode, rightNode)))
            return True 
        conflicts.append(Conflict(leftNode.attrib['name'], rightNode.attrib['name'], conflictType="Text"))
        return False
    
    if compareVersionName(leftNode.attrib['app'], rightNode.attrib['app']) == -1:
        workCopy.append(shallowCopyNode(rightNode))
        return True
    workCopy.append(shallowCopyNode(leftNode))
    return True









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
        returns None and merged string if there are no conflicts, otherwise return conflicts and None
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
    else:
        leftRoot.attrib['name'] = merged.attrib['name']
        
    # Merge simple till scenes
    for i in range(len(leftRoot)):
        # ignore project thumbnail, since it changes all the time and will be rendered new on a run
        if leftRoot[i].tag == "thumbnail":
            continue
        if leftRoot[i].tag != "scenes":
            simConflict, _ = mergeSimple(leftRoot[i], rightRoot[i], resolutions)
            if simConflict:
                for con in simConflict:
                    conflicts.append(con)
        else:
            scenesConflicts = mergeScenes(leftRoot[i], rightRoot[i], resolutions)
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
            conflictNode, cIndex = getNodeMatchByDef(leftNodeList, rNode)
            
            tmpRes = getResolution(resolutions)
            if tmpRes:
                leftNode[cIndex] = tmpRes.resolve(conflictNode, rNode)
                return None, leftNode[cIndex]
            
            if(leftNode.tag == "thumbnail"):
                retConflicts.append(Conflict(conflictNode.text, rNode.text, conflictType="Image"))
            elif ("script" not in conflictNode.tag):
                if "pentrails" in conflictNode.tag:
                    retConflicts.append(Conflict(conflictNode.text, rNode.text, conflictType="Image"))
                else:
                    retConflicts.append(Conflict(pretty_print_xml(leftNode), pretty_print_xml(rightNode), conflictType="Text"))
            else:
                retConflicts.append(Conflict(conflictNode, rNode))
    
    if len(leftNodeList) == 0:
        if not compareNodesSame(leftNode, rightNode, onlyCheck=""):
            tmpRes = getResolution(resolutions)
            if tmpRes:
                leftNode = tmpRes.resolve(leftNode, rightNode)
                return None, leftNode
            if(leftNode.tag == "thumbnail"):
                retConflicts.append(Conflict(leftNode.text, rightNode.text, conflictType="Image"))
            elif ("script" not in leftNode.tag):
                if "pentrails" in leftNode.tag:
                    retConflicts.append(Conflict(leftNode.text, rightNode.text, conflictType="Image"))
                else:
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
            conflictingLeftNode, cIndex = getNodeMatchByDef(leftNodeList, rNode)
            
            sceneConflicts = mergeScene(conflictingLeftNode, rNode)
            if sceneConflicts:
                retConflicts = sceneConflicts + con
            #retConflicts.append(Conflict(leftNode, rNode))
    return retConflicts


def getNodeMatchByDef(nodeList, node, onlyCheck=""):
    for i, n in enumerate(nodeList):
        if compareNodesDefinition(n, node, onlyCheck):
            return n, i
    return None, 0
        
        
def mergeScenes(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    leftNodeList = [n for n in leftNode]
    nodesToAdd = []
    retConflicts = []
    
    # compare all scene nodes from the right side with the left (to prevent disordering in some cases, nodes get matched in the next step and not only zipped)
    for rNode in rightNode:
        matchingLeftSubNode, cIndex = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="name")
        # if none found in the left side, just add rNode since the sub node is a new node in this case
        if matchingLeftSubNode == None:   
            nodesToAdd.append(rNode)
            continue
        
        # if node is found, check if merge needs to happen
        res = mergeScene(matchingLeftSubNode, rNode, resolutions)
        if res == None:
            continue
        
        # If node is returned, then it needs to be added to the parent
        if type(res) == ET.Element:
            nodesToAdd.append(res)
            continue
        
        # In case of a conflict, check if resolution exist and apply, otherwise propagate the conflict
        tmpResolution = getResolution(resolutions)
        if tmpResolution:
            # replace the left sub node with the resolution result since the left node is always used as last return / accumulator
            matchingLeftSubNode = tmpResolution.resolve(leftNode, rightNode)
        else:
            retConflicts = retConflicts + res
            
    for nta in nodesToAdd:
        leftNode.append(nta)        
    
    if len(retConflicts) > 0:
        return retConflicts


def mergeScene(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    conflicts = []
    for i in range(len(leftNode)):
        tmp = leftNode[i]
        # catch specials
        if leftNode[i].tag == "blocks":
            resConf = mergeBlocks(leftNode[i], rightNode[i],resolutions)
            if resConf:
                conflicts = conflicts + resConf
            continue
        if leftNode[i].tag == "stage":
            simConflict = mergeStage(leftNode[i], rightNode[i], resolutions)
            if simConflict:
                conflicts = conflicts + simConflict
            continue
        
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    if len(conflicts) > 0:
        return conflicts


# currently only simple merge, needs to be added
# todo
# def mergeBlocks(leftNode, rightNode):
#     simConflict, merged = mergeSimple(leftNode, rightNode)
#     # if simConflict:
#     #     return simConflict
#     return []

def mergeBlocks(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    leftNodeList = [n for n in leftNode]
    retConflicts = []
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode, onlyCheck="s")
        if "Post to smerge" in rNode.attrib["s"]:
            continue
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictingLeftNode, cIndex = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="s")
            
            tmpResolution = getResolution(resolutions)
            if tmpResolution:
                leftNode[cIndex] = tmpResolution.resolve(conflictingLeftNode, rNode)
                continue
            
            confs = mergeBlockDef(conflictingLeftNode, rNode, resolutions)
            if confs:
                retConflicts.append(confs)
    if len(retConflicts) > 0:
        return retConflicts
    
def mergeBlockDef(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    for i, subNode in enumerate(leftNode):
        if "script" in subNode.tag:
            l = copyElement(subNode)
            r = copyElement(rightNode[i])
            lBlockName = "Conflict-Block-Content: " + str(leftNode.attrib["s"])
            rBlockName = "Conflict-Block-Content: " + str(rightNode.attrib["s"])
            l.insert(0, ET.Element('custom-block', {'s': lBlockName}))
            r.insert(0, ET.Element('custom-block', {'s': rBlockName}))
            return Conflict(l, r, conflictType="CustomBlock", s=lBlockName, category=str(leftNode.attrib["category"]))
        
def mergeStage(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    conflicts = []
    for i in range(len(leftNode)):
        if leftNode[i].tag == "blocks":
            resConfs = mergeBlocks(leftNode[i], rightNode[i], resolutions)
            if resConfs:
                conflicts = conflicts + resConfs
            continue
            
        if leftNode[i].tag == "scripts":
            simConflict = mergeScripts(leftNode[i], rightNode[i], resolutions)
            if simConflict:
                conflicts = conflicts + simConflict
            continue
        
        if leftNode[i].tag == "sprites":
            conflicts = conflicts + mergeSprites(leftNode[i], rightNode[i], resolutions)
            continue
            
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    return conflicts


def mergeSprites(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    leftNodeList = [n for n in leftNode]
    retConflicts = []
    for rNode in rightNode:
        cont = containsNode(leftNodeList, rNode, onlyCheck="name")
        if cont == 0:
            leftNode.append(rNode)
        elif cont == 2:
            conflictingLeftNode, cIndex = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="name")
            confs = mergeSprite(conflictingLeftNode, rNode, resolutions)
            retConflicts = retConflicts + confs
    return retConflicts


def mergeSprite(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    conflicts = []
    for i in range(len(leftNode)):
        if leftNode[i].tag == "blocks":
            retConf = mergeBlocks(leftNode[i], rightNode[i], resolutions)
            if retConf != None:
                conflicts = conflicts + retConf
            continue
            
        if leftNode[i].tag == "scripts":
            simConflict = mergeScripts(leftNode[i], rightNode[i], resolutions)
            if simConflict:
                conflicts = conflicts + simConflict
            continue
            
        # the rest of the basic objects can be merged easy with the simpleMerge
        simConflict, merged = mergeSimple(leftNode[i], rightNode[i])
        if simConflict:
            conflicts = conflicts + simConflict
    return conflicts


def mergeScripts(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | list[Conflict]:
    """Merger for the scenes node. Matches each scene by id and then tries to merge the individual scenes

    Parameters
    ----------
    leftNode : ET.Element
        Root node for the left side of the single script merge.
    rightNode : ET.Element
        Root node for the right side of the single script merge.
    resolutions : list[Resolution]
        List of resolutions to be poped, by default []

    Returns
    -------
    None | list[Conflict]
        Returns either None if the list of conflicts from all sub scripts
    """
    leftNodeList = [n for n in leftNode]
    nodesToAdd = []
    retConflicts = []
    # compare all script nodes from the right side with the left (to prevent disordering to some cases, nodes get matched in the next step and not only zipped)
    for rNode in rightNode:
        matchingLeftSubNode, cIndex = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="customData")
        # if none found in the left side, just add rNode since the sub node is a new node in this case
        if matchingLeftSubNode == None:   
            nodesToAdd.append(rNode)
            continue
        
        # if node is found, check if merge needs to happen
        res = mergeScript(matchingLeftSubNode, rNode)
        if res == None:
            continue
        
        # If node is returned, then it needs to be added to the parent
        if type(res) == ET.Element:
            nodesToAdd.append(res)
            continue
        
        # In case of a conflict, check if resolution exist and apply, otherwise propagate the conflict
        tmpResolution = getResolution(resolutions)
        if tmpResolution:
            # replace the left sub node with the resolution result since the left node is always used as last return / accumulator
            leftNode[cIndex] = tmpResolution.resolve(matchingLeftSubNode, rNode)
        else:
            retConflicts.append(res)
            
    for nta in nodesToAdd:
        leftNode.append(nta)        
    
    if len(retConflicts) > 0:
        return retConflicts
        
        
    #     cont = containsNode(leftNodeList, rNode, onlyCheck="customData")
    #     if cont == 0:
    #         leftNode.append(rNode)
    #     elif cont == 2:
    #         conflictingLeftNode = getNodeMatchByDef(leftNodeList, rNode, onlyCheck="customData")
    #         retConflicts.append(Conflict(conflictingLeftNode, rNode))
    # return retConflicts



def mergeScript(leftNode: ET.Element, rightNode: ET.Element, resolutions: list[Resolution]=[]) -> None | ET.Element | Conflict:
    """Checks if two script nodes can be merged, or generate a conflict

    Parameters
    ----------
    leftNode : ET.Element
        Root node for the left side of the single script merge.
    rightNode : ET.Element
        Root node for the right side of the single script merge.
    resolutions : list[Resolution]
        List of resolutions to be poped

    Returns
    -------
    None | ET.Element | list[Conflict]
        Returns None if nothing needs to happen, a Element if right node needs to be added to the result or otherwise a Conflict
    -------
    """
    
    if not compareCustomDataNodes(leftNode, rightNode):
        if "customData" in leftNode.keys():
            if "customData" in rightNode.keys():
                lcd = leftNode.attrib["customData"]
                rcd = rightNode.attrib["customData"]
                
                # if different ids, nodes differ
                if lcd != rcd:
                    return rightNode
                else:
                    return Conflict(leftNode, rightNode)
        else:
            return Conflict(leftNode, rightNode)
    return None


def compareCustomDataNodes(leftNode: ET.Element, rightNode: ET.Element) -> bool:
    """Compares two nodes with a customData attribute

    Parameters
    ----------
    leftNode : ET.Element
        Left node (probably script)
    rightNode : ET.Element
        Right node (probably script)

    Returns
    -------
    bool :
        Bool indicating if both are the exact same apart from the first attributes
    -------
    """
    # if unequal children, nodes differ
    if len(leftNode) != len(rightNode):
        return False
    
    if leftNode.text != rightNode.text:
        return False
    
    # atomic escape
    if len(leftNode) == 0:
        return True
    
    # first nodes should contain customData, then only check the id, otherwise all attributes
    if "customData" in leftNode.keys():
        if "customData" in rightNode.keys():
            lcd = leftNode.attrib["customData"]
            rcd = rightNode.attrib["customData"]
            
            # if different ids, nodes differ
            if lcd != rcd:
                return False
        else:
            return False
    else:
        # check all attributes if same
        if len(leftNode.attrib) != len(rightNode.attrib):
            return False
        for lKey in leftNode.keys():
            # if leftKey doesn't exist in the right, nodes differ
            try:
                lVal = leftNode.attrib[lKey]
                rVal = rightNode.attrib[lKey]
                
                if lVal != rVal:
                    return False
            except KeyError:
                return False
    
    # recursive check child nodes if same
    nodePairs = zip(leftNode, rightNode)
    for (l, r) in nodePairs:
        if not compareCustomDataNodes(l, r):
            return False
    return True
    
    
        

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
    
    
    
    # conflicts, res = merge("moved.xml", "export.xml")
    # if conflicts:
    #     for c in conflicts:
    #         print(pretty_print_xml(c.leftElement))
    #         print("<-->")
    #         print(pretty_print_xml(c.rightElement))
    #         c.toFile("./","test")
    #     # print([str(c) for c in conflicts])
    # if res:
    #     print(pretty_print_xml(res))
    
    # tmp = SnapFileGenerator(projectName="project", appName="Snap! 9.0, https://snap.berkeley.edu")
    # tmp.addScene(SnapScene("test"))
    # # tmp.addScene(SnapScene("tes2"))
    # snap = tmp.generate()
    # original = copyElement(snap)
    # SnapFileGenerator.alterScripts(snap)
    
    # tree1 = ET.ElementTree(original)
    # tree2 = ET.ElementTree(snap)

    # # Write the ElementTree object to an XML file
    # with open('/tmp/snap_test_file_orig.xml', 'wb') as file:
    #     tree1.write(file)
    # with open('/tmp/snap_test_file_altered.xml', 'wb') as file:
    #     tree2.write(file)
    
    filePath1 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/106.xml"
    filePath2 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/109.xml"
    res = merge2(filePath1, filePath2, [])
    print(res)
    # if res:
    #     print(res)
    #     try:
    #         for elems in res[0]:
    #             print(str(elems),"\n")
    #     except:
    #         pass

    
    
    
    
    
    
        
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