import xml.etree.ElementTree as ET
import re

# from .generator import *
from enum import Enum
from typing import Callable


tmp1_file_path = "add_new.xml"
tmp2_file_path = "moved.xml"

# python merger_v2_2.py

import xml.dom.minidom


def pretty_print_xml(xml_tree):
    parsed_xml = xml.dom.minidom.parseString(
        ET.tostring(xml_tree, encoding="utf-8").decode("utf-8")
    )
    pretty_xml_as_string = parsed_xml.toprettyxml(indent="  ")
    return re.sub(
        r"\n\s*\n+", "\n", pretty_xml_as_string.replace('<?xml version="1.0" ?>\n', "")
    )
    # .replace('<?xml version="1.0" ?>\n',"")
    # re.sub(r'\s*\n\s*', '\n',


def nodeToString(xmlNode: ET.Element, level=0, indent="  ") -> str:
    if len(xmlNode) == 0:
        return (indent * level) + cap_string(nodeToReadable(xmlNode))
    ret = (indent * (level)) + cap_string(nodeToReadable(xmlNode)) + "\n"
    for i, child in enumerate(xmlNode):
        ret += f"{nodeToString(child, level+1)}" + "\n"
    ret += f"{indent * (level)}</{xmlNode.tag}>"
    return ret


def nodeToReadable(node: ET.Element):
    attribs = " ".join([(f'{key}="{value}"') for (key, value) in node.attrib.items()])
    return f"<{node.tag}{' ' if attribs != '' else ''}{attribs}>"


def cap_string(input_string, max_length=50):
    if len(input_string) <= max_length:
        return input_string
    else:
        return input_string[:max_length] + "..."


# class Conflict:
#     def __init__(
#         self, leftElement, rightElement, conflictType="Element", s="", category=""
#     ):
#         self.leftElement = leftElement
#         self.rightElement = rightElement
#         if conflictType not in ["Element", "Text", "Image", "CustomBlock"]:
#             raise ValueError(
#                 "Invalid conflictType. It must be one of 'Element', 'Text', or 'Image'."
#             )
#         self.conflictType = conflictType
#         self.s = s
#         self.category = category

#     def __str__(self):
#         return f"Conflict ({self.conflictType}): {self.leftElement} <-> {self.rightElement}"

#     def toFile(self, leftFilePath, rightFilePath):
#         if self.conflictType == "Element" or self.conflictType == "CustomBlock":
#             projectName = "view"
#             versionName = "Snap! 9.0, https://snap.berkeley.edu"
#             file1, test, blocks = create_snap_file(projectName, versionName)
#             test.append(self.leftElement)

#             if self.conflictType == "CustomBlock":
#                 firstElem = self.leftElement[0]
#                 if "custom-block" in firstElem.tag:
#                     for block in blocks:
#                         block.append(
#                             SnapCustomBlock(s=self.s, category=self.category).generate()
#                         )

#             with open(leftFilePath, "w") as f:
#                 f.write(pretty_print_xml(file1.getroot()))

#             file2, test2, blocks = create_snap_file(projectName, versionName)
#             test2.append(self.rightElement)

#             if self.conflictType == "CustomBlock":
#                 firstElem = self.rightElement[0]
#                 if "custom-block" in firstElem.tag:
#                     for block in blocks:
#                         block.append(
#                             SnapCustomBlock(s=self.s, category=self.category).generate()
#                         )
#             with open(rightFilePath, "w") as f:
#                 f.write(pretty_print_xml(file2.getroot()))
#         else:
#             with open(leftFilePath, "w") as f:
#                 f.write(self.leftElement)
#             with open(rightFilePath, "w") as f:
#                 f.write(self.rightElement)


class ConflictTypes(Enum):
    ELEMENT = "Element"
    TEXT = "Text"
    IMAGE = "Image"
    CUSTOMBLOCK = "CustomBlock"
    WATCHER = "Watcher"
    AUDIO = "Audio"


class Conflict:
    def __init__(
        self,
        leftElement,
        rightElement,
        conflictType="Element",
        s="",
        category="",
        parentPath="",
        parentImage="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        cxl=None,
        cyl=None,
        cxr=None,
        cyr=None,
    ):
        self.leftElement = leftElement
        self.rightElement = rightElement
        if conflictType not in [e.value for e in ConflictTypes]:
            raise ValueError(
                f"Invalid conflictType. It must be one of {[e.value for e in ConflictTypes]}."
            )
        self.conflictType = conflictType
        self.s = s
        self.category = category
        self.parentPath = parentPath
        self.parentImage = parentImage
        self.cxl = cxl
        self.cyl = cyl
        self.cxr = cxr
        self.cyr = cyr

    def __str__(self):
        return f"Conflict ({self.conflictType}): {self.leftElement} <-> {self.rightElement} (Path: {self.parentPath})"

    def toFile(self, leftFilePath, rightFilePath):
        if self.conflictType == "Element" or self.conflictType == "CustomBlock":
            projectName = "view"
            versionName = "Snap! 9.0, https://snap.berkeley.edu"
            file1, test, blocks = create_snap_file(projectName, versionName)
            test.append(self.leftElement)

            if self.conflictType == "CustomBlock":
                firstElem = self.leftElement[0]
                if "custom-block" in firstElem.tag:
                    for block in blocks:
                        block.append(
                            SnapCustomBlock(s=self.s, category=self.category).generate()
                        )

            with open(leftFilePath, "w") as f:
                f.write(pretty_print_xml(file1.getroot()))

            file2, test2, blocks = create_snap_file(projectName, versionName)
            test2.append(self.rightElement)

            if self.conflictType == "CustomBlock":
                firstElem = self.rightElement[0]
                if "custom-block" in firstElem.tag:
                    for block in blocks:
                        block.append(
                            SnapCustomBlock(s=self.s, category=self.category).generate()
                        )
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
    """Resolution contains information to resolve a conflict. Steps can be "left", "right" or "data" """

    def __init__(self, step: Step, additionalData: str = ""):
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
# ---------------------------------------------------------- UTILITY Classes ----------------------------------------------------------
# -------------------------------------------------------------------------------------------------------------------------------------


class AdditionalData:
    """
    AdditionalData contains the work copy of the current merge and all gathered data during the merge,
    like current path or images for better conflict visualization
    """

    workCopy: ET.Element
    currentElement: ET.Element
    currentPath: list[str] = ["/"]
    currentImage: list[str] = [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    ]
    conflicts: list[Conflict] = []
    resolutions: list[Resolution]

    def __init__(self, workCopy: ET.Element, resolutions: list[Resolution] = []):
        self.workCopy = workCopy
        self.resolutions = resolutions

    def __str__(self):
        return f"AdditionalData: {self.currentPath}, {self.currentImage[:30]}"

    def addAndSwitch(self, newElement: ET.Element):
        tmp = shallowCopyNode(newElement)
        self.currentElement.append(tmp)
        self.currentElement = tmp

    def addPath(self, path: str):
        self.currentPath.append(path)

    def popPath(self):
        return self.currentPath.pop()

    def getCurrentPath(self):
        if len(self.currentPath) == 1:
            return self.currentPath[0]
        return "".join(self.currentPath)

    def addImage(self, image: str):
        self.currentImage.append(image)

    def popImage(self):
        if len(self.currentImage) == 1:
            return self.currentImage[0]
        return self.currentImage.pop()

    def getCurrentImage(self):
        return self.currentImage[-1]


class ACM:
    """ArrayContextManager used in combination with open() to append and remove the given element from the given list on enter and exit of the open"""

    def __init__(self, array, element):
        self.array = array
        self.element = element

    def __enter__(self):
        self.array.append(self.element)

    def __exit__(self, type, value, traceback):
        self.array.remove(self.element)


# -------------------------------------------------------------------------------------------------------------------------------------
# --------------------------------------------------------- UTILITY FUNCTIONS ---------------------------------------------------------
# -------------------------------------------------------------------------------------------------------------------------------------


def modularZipper(
    leftRoot: ET.Element,
    rightRoot: ET.Element,
    zipperFoo: Callable[[ET.Element, list[ET.Element], str], ET.Element | None],
    attribute: str = "",
):
    leftList = [x for x in leftRoot]
    rightList = [x for x in rightRoot]
    retZips = []
    retUniques = []

    for leftNode in leftList:
        foundNode = zipperFoo(leftNode, rightList, attribute)
        if foundNode != None:
            retZips.append((leftNode, foundNode))
            rightList.remove(foundNode)
        else:
            retUniques.append(leftNode)
    for restNode in rightList:
        retUniques.append(restNode)

    return retZips, retUniques


def zipMatchingNodesByTag(
    leftRoot: ET.Element, rightRoot: ET.Element
) -> tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:
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
    return modularZipper(leftRoot, rightRoot, findNodeByTag, "")


def zipMatchingNodesByAttribute(
    leftRoot: ET.Element, rightRoot: ET.Element, attribute: str = "name"
) -> tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:
    """Combines nodes with the same attribute given from both sides and returns a zipped list.
    Unique attributed nodes are returned in a separate list.

    Parameters
    ----------
    leftRoot : ET.Element
        Element tree parent node for the left side
    rightRoot : ET.Element
        Element tree parent node for the left side
    attribute : str, optional
        Attribute key to match nodes, by default "name"

    Returns
    -------
    tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:\n
            1. List of ET.Element zips with matching attribute
            2. Unique tag elements
    -------
    """
    return modularZipper(leftRoot, rightRoot, findNodeByAttribute, attribute)


def zipMatchingNodesByAttributeForLists(
    leftRoot: ET.Element, rightRoot: ET.Element, attribute: str = "name"
) -> tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:
    """Combines nodes with the same attribute given from both sides and returns a zipped list.
    Unique attributed nodes are returned in a separate list. Works for lists type nodes and checks attributes inside the \<item>

    Parameters
    ----------
    leftRoot : ET.Element
        Element tree parent node for the left side
    rightRoot : ET.Element
        Element tree parent node for the left side
    attribute : str, optional
        Attribute key to match nodes, by default "name"

    Returns
    -------
    tuple[list[tuple[ET.Element, ET.Element]], list[ET.Element]]:\n
            1. List of ET.Element zips with matching attribute
            2. Unique tag elements
    -------
    """
    return modularZipper(leftRoot, rightRoot, findNodeByAttributeLists, attribute)


def findNodeByTag(
    targetNode: ET.Element, searchNodeList: list[ET.Element], attribute: str
) -> ET.Element | None:
    """Returns the first matching node from the list or None

    Parameters
    ----------
    targetNode : ET.Element
        Single node to be matched by tag
    searchNodeList : list[ET.Element]
        List of nodes to be searched
    attribute: str
        not used, only for generic...

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


def findNodeByAttribute(
    targetNode: ET.Element, searchNodeList: list[ET.Element], attribute: str
) -> ET.Element | None:
    """Returns the first matching node from the list or None

    Parameters
    ----------
    targetNode : ET.Element
        Single node to be matched by tag
    searchNodeList : list[ET.Element]
        List of nodes to be searched
    attribute: str
        Key of attribute to find

    Returns
    -------
    ET.Element | None:
        Returns the node
    -------
    """
    for sNode in searchNodeList:
        if attribute in sNode.keys() and attribute in targetNode.keys():
            if sNode.attrib[attribute] == targetNode.attrib[attribute]:
                return sNode
    return None


def findNodeByAttributeLists(
    targetNode: ET.Element, searchNodeList: list[ET.Element], attribute: str
) -> ET.Element | None:
    """Returns the first matching node from the list or None

    Parameters
    ----------
    targetNode : ET.Element
        Single node to be matched by tag
    searchNodeList : list[ET.Element]
        List of nodes to be searched
    attribute: str
        Key of attribute to find

    Returns
    -------
    ET.Element | None:
        Returns the node
    -------
    """
    for sNode in searchNodeList:
        if attribute in sNode[0].keys() and attribute in targetNode[0].keys():
            if sNode[0].attrib[attribute] == targetNode[0].attrib[attribute]:
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


def copyNode(node: ET.Element) -> ET.Element:
    """Create a deep copy of an ET node

    Parameters
    ----------
    node : ET.Element
        Node to be copied

    Returns
    -------
    ET.Element
        Copied node with all children and attributes
    """
    return ET.fromstring(ET.tostring(node, encoding="utf-8").decode("utf-8"))


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
            partsLeft = matchesLeft[0][0].split(".")
            partsRight = matchesRight[0][0].split(".")

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


def isAtomic(node: ET.Element) -> bool:
    """Check if a node is a leaf (the smallest element)

    Parameters
    ----------
    node : ET.Element
        Node to be checked

    Returns
    -------
    bool
        Returns if the node is atomic or not
    """
    return len(node) == 0


def compareNodesDefinition(
    leftNode: ET.Element, rightNode: ET.Element, keysToCheck: list[str] = []
) -> bool:
    """Check if the nodes are the same by definitions (tag, attributes, text)

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    keysToCheck : list[str], optional
        List of attribute keys that will be checked in the compare (checks all if []), by default []

    Returns
    -------
    bool
        Returns if the nodes are the same by given definitions
    """
    if leftNode.tag != rightNode.tag:
        return False

    if len(keysToCheck) > 0:
        for onlyCheck in keysToCheck:
            if onlyCheck in leftNode.keys() and onlyCheck in rightNode.keys():
                if leftNode.attrib[onlyCheck] != rightNode.attrib[onlyCheck]:
                    return False
    else:
        if leftNode.keys() != rightNode.keys():
            return False

    if leftNode.text and rightNode.text:
        if leftNode.text != rightNode.text:
            return False

    if (leftNode.text is None and rightNode.text is not None) or (
        leftNode.text is not None and rightNode.text is None
    ):
        return False

    if len(keysToCheck) == 0:
        for i in range(len(leftNode.attrib)):
            if (
                leftNode.attrib[leftNode.keys()[i]]
                != rightNode.attrib[rightNode.keys()[i]]
            ):
                return False
    return True


def compareNodesSame(
    leftNode: ET.Element, rightNode: ET.Element, keysToCheck: list[str] = []
) -> bool:
    """Reccursifly compares two nodes and return true if they are the same and false if they differ

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    keysToCheck : list[str], optional
        List of attribute keys that will be checked in the compare (checks all if []), by default []

    Returns
    -------
    bool
        Returns if the nodes are the same or not
    """
    # Break case, if leaf and same, ret true
    if isAtomic(leftNode) and isAtomic(rightNode):
        return atomicMerge(
            leftNode, rightNode, AdditionalData(ET.Element("None")), virtual=True
        )
        return conflict == None

    # If one is not atomic, they differ return false
    if isAtomic(leftNode) != isAtomic(rightNode):
        return False
    if len(leftNode) != len(rightNode):
        return False
    if not compareNodesDefinition(leftNode, rightNode, keysToCheck):
        return False

    res = True
    for l, r in zip(leftNode, rightNode):
        if not res:
            break
        res = res and compareNodesSame(l, r)
    return res


def getNodesCombinationState(
    leftNode: ET.Element, rightNode: ET.Element, keysToCheck: list[str] = []
) -> int:
    """Check if the nodes are the same, unique or same but with different attributes / children

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    keysToCheck : list[str], optional
        List of keys of attributes to check for equality, by default []

    Returns
    -------
    int :
        0 if both are the same | 1 if the are unique | 2 if they are the same but with different attributes / children (conflict)
    -------
    """
    if compareNodesSame(leftNode, rightNode, keysToCheck):
        return 0
    if compareNodesDefinition(leftNode, rightNode, keysToCheck):
        return 2
    # add exception for <l> nodes
    if leftNode.tag == "l" and len(leftNode.keys()) == 0:
        if leftNode.text != rightNode.text:
            return 2
    return 1


def isDefaultListType(node: ET.Element) -> bool:
    """Check if a node is a default list i.e. has only atomic list children or sub items filled with data

    Parameters
    ----------
    node : ET.Element
        Node to be checked

    Returns
    -------
    bool
        Returns if the node is a default list type or not
    """
    if len(node) == 0:
        return False
    return (
        node[0].tag == "list"
        and "struct" in node[0].keys()
        and node[0].attrib["struct"] == "atomic"
    )


# -------------------------------------------------------------------------------------------------------------------------------------
# ---------------------------------------------------------  MERGE FUNCTIONS  ---------------------------------------------------------
# -------------------------------------------------------------------------------------------------------------------------------------


def merge2(
    leftFilePath: str,
    rightFilePath: str,
    resolutions: list[Resolution] = [],
    outputAsET: bool = False,
) -> tuple[list[Conflict] | None, str]:
    """Main merging function

    Parameters
    ----------
    file1Path : str
        Path to left xml File.
    file2Path : str
        Path to right xml File.
    resolutions : list[Resolution], optional
        List of resolutions, by default []
    outputAsET : bool, optional
        If true, returns the merged tree as ET.Element, by default False

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

    ad = AdditionalData(workCopy)
    ad.resolutions = resolutions

    # Merge Project Definitions
    if mergeProjectDef(leftRoot, rightRoot, ad):
        # only done the first time to init the working copy with the base node
        ad.workCopy = ad.workCopy[0]
        ad.currentElement = ad.workCopy

    zippedNodes, uniqueNodes = zipMatchingNodesByTag(leftRoot, rightRoot)

    for node in uniqueNodes:
        ad.currentElement.append(node)

    # Merge children
    res = True
    for i, (leftNode, rightNode) in enumerate(zippedNodes):
        match leftNode.tag:
            case "thumbnail":
                ad.addImage(leftNode.text)
                ad.currentElement.append(leftNode)
                continue
            # Merge scenes
            case "scenes":
                res &= mergeScenes(leftNode, rightNode, ad)
            # Merge others
            case default:
                res &= mergeSimple(leftNode, rightNode, ad)

    if not res:
        return ad.conflicts, None
    if outputAsET:
        return None, ad.workCopy
    return None, ET.tostring(ad.workCopy, encoding="UTF-8")


def mergeProjectDef(
    leftNode: ET.Element, rightNode: ET.Element, ad: AdditionalData
) -> bool:
    """Merger for the project definition node type\n
    Checks name and project version (newer version will be chosen)

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool :
        Returns if merge was successful or not
    -------
    """
    if leftNode.attrib["name"] != rightNode.attrib["name"]:
        tmpRes = getResolution(ad.resolutions)
        if tmpRes:
            ad.workCopy.append(shallowCopyNode(tmpRes.resolve(leftNode, rightNode)))
            return True
        ad.conflicts.append(
            Conflict(
                leftNode.attrib["name"], rightNode.attrib["name"], conflictType="Text"
            )
        )
        return False

    if compareVersionName(leftNode.attrib["app"], rightNode.attrib["app"]) == -1:
        ad.workCopy.append(shallowCopyNode(rightNode))
        return True
    ad.workCopy.append(shallowCopyNode(leftNode))
    return True


def mergeSimple(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    keysToCheck: list[str] = [],
    zipKey: str = "name",
) -> bool:
    """Merge for basic node types without specific merge, first checks if atomic node (only text) and merges if yes\n
    if not, decides on further simple merge steps and runs it

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data
    keysToCheck : list[str], optional
        List of attributes to compare if equal or not, on empty list, compares all attributes, by default []
    zipKey : str, optional
        Key of attribute to zip matching nodes, by default "name"\nOn empty zipKey, it will compare by tag

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    nodeState = getNodesCombinationState(leftNode, rightNode, keysToCheck)
    # fin merge if same or unique, otherwise go deeper
    match nodeState:
        case 0:
            ad.currentElement.append(leftNode)
            return True
        case 1:
            ad.currentElement.append(leftNode)
            ad.currentElement.append(rightNode)
            return True
        case 2:
            if len(leftNode) + len(rightNode) == 0:
                return atomicMerge(leftNode, rightNode, ad, keysToCheck)

            ad.addAndSwitch(leftNode)
            if len(leftNode) == 1 and len(rightNode) == 1 and leftNode[0].tag == "l":
                return mergeSimple(leftNode[0], rightNode[0], ad, keysToCheck, "")

            if zipKey == "":
                zips, uniqueNodes = zipMatchingNodesByTag(leftNode, rightNode)
            else:
                zips, uniqueNodes = zipMatchingNodesByAttribute(
                    leftNode, rightNode, zipKey
                )
            for node in uniqueNodes:
                ad.currentElement.append(node)
            res = True
            for i, (left, right) in enumerate(zips):
                # on uneven children, conflict
                childRatio = len(left) - len(right)
                if childRatio > 0 or childRatio < 0:
                    tmpResolution = getResolution(ad.resolutions)
                    if tmpResolution:
                        ad.currentElement.append(
                            tmpResolution.resolve(leftNode, rightNode)
                        )
                        continue
                    else:
                        ad.conflicts.append(Conflict(leftNode, rightNode))
                        continue

                # check atomic or more children
                if len(left) + len(right) > 0:
                    if left.tag == "l":
                        res &= mergeSimple(left, right, ad, keysToCheck, "")
                    else:
                        res &= mergeSimple(left, right, ad, keysToCheck, zipKey)
                else:
                    res &= atomicMerge(left, right, ad, virtual=False)
            return res


def atomicMerge(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    virtual: bool = False,
) -> bool:
    """Merge the smallest leaf if they are exact the same, conflict otherwise

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data
    virtual : bool, optional
        If true, only returns if merge was successful and not save any data in ad, by default False

    Returns
    -------
    bool
        Returns if merge was successful or not
    """

    def retConflict(leftNode, rightNode):
        if not virtual:
            tmpResolution = getResolution(ad.resolutions)
            if tmpResolution:
                ad.currentElement.append(tmpResolution.resolve(leftNode, rightNode))
                return True
            else:
                match (leftNode.tag):
                    case "costume":
                        ad.conflicts.append(
                            Conflict(
                                leftNode.attrib["image"],
                                rightNode.attrib["image"],
                                conflictType=ConflictTypes.IMAGE.value,
                                parentPath=ad.getCurrentPath(),
                                parentImage=ad.getCurrentImage(),
                                cxl=leftNode.attrib["center-x"],
                                cyl=leftNode.attrib["center-y"],
                                cxr=rightNode.attrib["center-x"],
                                cyr=rightNode.attrib["center-y"],
                            )
                        )
                    case "sound":
                        ad.conflicts.append(
                            Conflict(
                                leftNode.attrib["sound"],
                                rightNode.attrib["sound"],
                                conflictType="Audio",
                                parentPath=ad.getCurrentPath(),
                                parentImage=ad.getCurrentImage(),
                                cxl=leftNode.attrib["name"],
                                cxr=rightNode.attrib["name"],
                            )
                        )
                    case "l":
                        name = ad.currentElement.attrib["name"]
                        ad.conflicts.append(
                            Conflict(
                                f"Variable '{name}' value: {leftNode.text}",
                                f"Variable '{name}' value: {rightNode.text}",
                                conflictType="Text",
                                parentPath=ad.getCurrentPath(),
                                parentImage=ad.getCurrentImage(),
                            )
                        )
                    case default:
                        ad.conflicts.append(
                            Conflict(leftNode, rightNode),
                            parentPath=ad.getCurrentPath(),
                            parentImage=ad.getCurrentImage(),
                        )

        return False

    if leftNode.tag != rightNode.tag:
        return retConflict(leftNode, rightNode)
    if leftNode.text != rightNode.text:
        return retConflict(leftNode, rightNode)
    if len(leftNode.attrib) != len(rightNode.attrib):
        return retConflict(leftNode, rightNode)
    leftKeys = leftNode.keys()
    rightKeys = rightNode.keys()
    for i in range(min(len(leftNode.attrib), len(rightNode.attrib))):
        v1 = leftNode.attrib[leftKeys[i]]
        v2 = rightNode.attrib[rightKeys[i]]
        if leftKeys[i] != rightKeys[i]:
            return retConflict(leftNode, rightNode)
        if v1 != v2:
            return retConflict(leftNode, rightNode)
    if not virtual:
        ad.currentElement.append(leftNode)
    return True


# steps for sub mergers
# check if current node is same, unique or differ
# on same copy into current element in ad
# on unique copy into current element in ad
# on differ, check if conflict and apply or propagate conflict / deeper merges
# for this shallow copy current and step deeper (update currentElement in ad)


def mergeScenes(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    matchAttribs: list[str] = [],
) -> bool:
    """Merge for scenes node type, checks if the scenes are the same, unique or differ and runs the needed sub mergers

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    ad.addAndSwitch(leftNode)
    zips, uniqueNodes = zipMatchingNodesByAttribute(leftNode, rightNode, "customData")
    for unique in uniqueNodes:
        ad.currentElement.append(unique)

    res = True
    for i, (left, right) in enumerate(zips):
        res &= mergeScene(left, right, ad)
    return res


def mergeScene(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for scene node type, checks if two single scene nodes are the same, unique or can conflict

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    with ACM(ad.currentPath, leftNode.attrib["name"] + "/"):
        nodeState = getNodesCombinationState(leftNode, rightNode)
        # fin merge if same or unique, otherwise go deeper
        match nodeState:
            case 0:
                ad.currentElement.append(leftNode)
                return True
            case 1:
                ad.currentElement.append(leftNode)
                ad.currentElement.append(rightNode)
                return True
            case 2:
                ad.addAndSwitch(leftNode)
                currentSave = ad.currentElement
                zips, uniqueNodes = zipMatchingNodesByTag(leftNode, rightNode)
                for unique in uniqueNodes:
                    ad.currentElement.append(unique)
                res = True
                for i, (left, right) in enumerate(zips):
                    res &= mergeDecider(left, right, ad)
                    ad.currentElement = currentSave
                return res


def mergeDecider(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge decider only checks tags and executes the matching sub merger step. Only run if tags are the same!

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    match leftNode.tag:
        case "pentrails":
            ad.currentElement.append(leftNode)
            return True
        case "blocks":
            return mergeBlocks(leftNode, rightNode, ad)
        case "stage":
            return mergeStage(leftNode, rightNode, ad)
        case "costumes":
            return modularListMerge(leftNode, rightNode, ad, "costumes")
        case "sounds":
            return modularListMerge(leftNode, rightNode, ad, "sounds")
        case "sprites":
            return mergeSprites(leftNode, rightNode, ad)
        case "scripts":
            return mergeScripts(leftNode, rightNode, ad)
        case "notes":
            return mergeNotes(leftNode, rightNode, ad)
        case default:
            return mergeSimple(leftNode, rightNode, ad)


def mergeBlocks(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for blocks node type, checks if the blocks are the same, unique or conflicts and runs the needed sub mergers

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    ad.addAndSwitch(leftNode)
    zips, uniqueNodes = zipMatchingNodesByAttribute(leftNode, rightNode, "customData")
    addedUploadOnce = False
    for unique in uniqueNodes:
        if "s" in unique.keys() and "Post to smerge" in unique.attrib["s"]:
            if addedUploadOnce:
                continue
            ad.currentElement.append(unique)
            addedUploadOnce = True
        else:
            ad.currentElement.append(unique)

    res = True
    for i, (left, right) in enumerate(zips):
        # just add one if upload script since url always changes and is set right after merge
        if "s" in left.keys():
            if "Post to smerge" in left.attrib["s"]:
                ad.currentElement.append(left)
                continue

        res &= mergeBlock(left, right, ad)
    return res


def mergeBlock(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for block node type, checks if the blocks are the same, unique or conflicts. Since custom blocks are a complete unit, just return a conflict for the whole if needed.

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    nodeState = getNodesCombinationState(leftNode, rightNode)
    # fin merge if same or unique, otherwise conflict since block-def
    match nodeState:
        case 0:
            ad.currentElement.append(leftNode)
            return True
        case 1:
            ad.currentElement.append(leftNode)
            ad.currentElement.append(rightNode)
            return True
        case 2:
            tmpResolution = getResolution(ad.resolutions)
            if tmpResolution:
                ad.currentElement.append(tmpResolution.resolve(leftNode, rightNode))
                return True
            else:
                lScript = copyNode(leftNode.find("script"))
                rScript = copyNode(rightNode.find("script"))
                lBlockName = "Conflict-Block-Content: " + str(leftNode.attrib["s"])
                rBlockName = "Conflict-Block-Content: " + str(rightNode.attrib["s"])
                lScript.insert(0, ET.Element("custom-block", {"s": lBlockName}))
                rScript.insert(0, ET.Element("custom-block", {"s": rBlockName}))
                ad.conflicts.append(
                    Conflict(
                        lScript,
                        rScript,
                        conflictType="CustomBlock",
                        s=lBlockName,
                        category=str(leftNode.attrib["category"]),
                        parentPath=ad.getCurrentPath(),
                        parentImage=ad.getCurrentImage(),
                    )
                )
                return False


def mergeStage(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for stage node type, checks if the stage nodes are the same, unique or conflicts and runs the needed sub mergers

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    with ACM(ad.currentPath, f'{leftNode.attrib["name"]}/'):
        nodeState = getNodesCombinationState(leftNode, rightNode)
        match nodeState:
            case 0:
                ad.currentElement.append(leftNode)
                return True
            # only check same, since only one stage can exist so both can't be unique at this point (at least without bugs...)
            case 1:
                print("Error: Stage nodes are unique!")
                print(leftNode)
                print(rightNode)
                return False
            case default:
                ad.addAndSwitch(leftNode)
                currentSave = ad.currentElement
                res = True
                zips, uniqueNodes = zipMatchingNodesByTag(leftNode, rightNode)
                for unique in uniqueNodes:
                    ad.currentElement.append(unique)

                pentrails = leftNode.find("pentrails")
                # ensure image
                if not pentrails:
                    pentrails = ad.getCurrentImage
                with ACM(ad.currentImage, pentrails):
                    for i, (left, right) in enumerate(zips):
                        res &= mergeDecider(left, right, ad)
                        ad.currentElement = currentSave
                return res


def modularListMerge(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    tag: str,
) -> bool:
    """Modular merger for list type nodes, like costumes or sounds, checks if the nodes are the same, unique or conflicts. In addition checks if atomic list struct or user items and always choses the later if applicable

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data
    tag : str
        Tag inside the item nodes of the list (like "costume" for the \<item><costume ... />\</item> structure)

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    ad.addAndSwitch(leftNode)
    # check default list or not
    if isDefaultListType(leftNode):
        zips, uniqueNodes = zipMatchingNodesByAttribute(leftNode, rightNode, "id")
        for unique in uniqueNodes:
            ad.currentElement.append(unique)
        for left, right in zips:
            ad.currentElement.append(left)
        return True
    else:
        ad.addAndSwitch(shallowCopyNode(leftNode[0]))
        zips, uniqueNodes = zipMatchingNodesByAttributeForLists(
            leftNode[0], rightNode[0], "customData"
        )
        for unique in uniqueNodes:
            ad.currentElement.append(unique)

        res = True
        for i, (left, right) in enumerate(zips):
            res &= mergeSimple(left, right, ad, "")
        return res


def mergeSprites(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    matchAttribs: list[str] = [],
) -> bool:
    """Merge for sprites node type, checks if the sprites are the same, unique or differ and runs the needed sub mergers

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    ad.addAndSwitch(leftNode)
    currentElementBackup = ad.currentElement
    zips, uniqueNodes = zipMatchingNodesByAttribute(leftNode, rightNode, "customData")

    res = True
    for i, (left, right) in enumerate(zips):
        res &= mergeSprite(left, right, ad)

    # watcher filter
    uniqueNodes = filterWatcher(uniqueNodes)
    for unique in uniqueNodes:
        currentElementBackup.append(unique)

    return res


def filterWatcher(nodes: list[ET.Element]) -> list[ET.Element]:
    """Filter out duplicate watcher nodes from a list of elements

    Parameters
    ----------
    nodes : list[ET.Element]
        List of nodes to filter

    Returns
    -------
    list[ET.Element]
        Returns the filtered list
    """
    ret = []
    for node in nodes:
        if node.tag != "watcher":
            ret.append(node)
        else:
            if not any(
                n.tag == "watcher" and n.attrib["var"] == node.attrib["var"]
                for n in ret
            ):
                ret.append(node)
    return ret


def mergeSprite(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for sprite node type, checks if two single sprite nodes are the same, unique or can conflict

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    with ACM(ad.currentPath, leftNode.attrib["name"] + "/"):
        nodeState = getNodesCombinationState(leftNode, rightNode)
        # fin merge if same or unique, otherwise go deeper
        match nodeState:
            case 0:
                ad.currentElement.append(leftNode)
                return True
            case 1:
                ad.currentElement.append(leftNode)
                ad.currentElement.append(rightNode)
                return True
            case 2:
                ad.addAndSwitch(leftNode)
                currentSave = ad.currentElement
                zips, uniqueNodes = zipMatchingNodesByTag(leftNode, rightNode)
                for unique in uniqueNodes:
                    ad.currentElement.append(unique)
                res = True
                for i, (left, right) in enumerate(zips):
                    res &= mergeDecider(left, right, ad)
                    ad.currentElement = currentSave
                return res


def mergeScripts(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    matchAttribs: list[str] = [],
) -> bool:
    """Merge for scripts node type, checks if the scripts are the same, unique or differ and runs the needed sub mergers

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    ad.addAndSwitch(leftNode)
    zips, uniqueNodes = zipMatchingNodesByAttribute(leftNode, rightNode, "customData")
    for unique in uniqueNodes:
        ad.currentElement.append(unique)

    res = True
    for i, (left, right) in enumerate(zips):
        res &= mergeScript(left, right, ad)
    return res


def mergeScript(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
) -> bool:
    """Merge for script node type, checks if two single script nodes are the same, unique or can conflict

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    nodeState = getNodesCombinationState(leftNode, rightNode, ["customData"])
    # fin merge if same or unique, otherwise go deeper
    match nodeState:
        case 0:
            ad.currentElement.append(leftNode)
            return True
        case 1:
            ad.currentElement.append(leftNode)
            ad.currentElement.append(rightNode)
            return True
        case 2:
            # extend with possible auto resolves for top / bottom changes later
            tmpResolution = getResolution(ad.resolutions)
            if tmpResolution:
                ad.currentElement.append(tmpResolution.resolve(leftNode, rightNode))
                return True
            else:
                ad.conflicts.append(
                    Conflict(
                        leftNode,
                        rightNode,
                        parentPath=ad.getCurrentPath(),
                        parentImage=ad.getCurrentImage(),
                    )
                )
                return False


def mergeNotes(leftNode: ET.Element, rightNode: ET.Element, ad: AdditionalData) -> bool:
    """Merge notes nodes together to reduce conflicts (simple combination does not affect snap, therefore just merge)

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    nodeState = getNodesCombinationState(leftNode, rightNode, ["customData"])
    # fin merge if same or unique, otherwise go deeper
    match nodeState:
        case 0:
            ad.currentElement.append(leftNode)
            return True
        case default:
            leftNode.text = leftNode.text + "\n" + rightNode.text
            ad.currentElement.append(leftNode)
            return True


########################################################################################################
def default(
    leftNode: ET.Element,
    rightNode: ET.Element,
    ad: AdditionalData,
    matchAttribs: list[str] = [],
) -> bool:
    """Merge for basic node types without specific merge, first checks if atomic node (only text) and merges if yes\n
    if not, decides on further simple merge steps and runs it

    Parameters
    ----------
    leftNode : ET.Element
        Left node to compare
    rightNode : ET.Element
        Right node to compare
    ad : AdditionalData
        Object containing all needed additional data
    matchAttribs : list[str], optional
        List of attributes to compare if equal or not, on empty list, compares all attributes, by default []

    Returns
    -------
    bool
        Returns if merge was successful or not
    """
    return True


########################################################################################################


if __name__ == "__main__":
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

    # tagLeft= ET.fromstring('<list><l>ux</l><l>uy</l><l>d1</l><l>d2</l><l>d3</l><l>n1</l><l>n2</l><l>tx</l><l>ty</l><l>tz</l><l>w</l></list>')
    # tagRight= ET.fromstring('<list><l>ux</l><l a="1">uy</l><l>d1</l><l>d2</l><l>d3</l><l>n1</l><l>n2</l><l>tx</l><l>ty</l><l>tz</l><l>w</l></list>')

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

    filePath1 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/basic_list_0.xml"
    filePath2 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/basic_list_1.xml"

    fileCostumesPath1 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/costumes_list_0.xml"
    fileCostumesPath2 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/costumes_list_1.xml"

    fileCol1 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/n1.xml"
    fileCol2 = "/home/rs-kubuntu/Desktop/Smerge-Private/snapmerge/home/Merger_Two_ElectricBoogaloo/test_files/n2.xml"

    treeLeft = ET.parse(fileCol1)
    treeRight = ET.parse(fileCol2)

    leftRoot = treeLeft.getroot()
    rightRoot = treeRight.getroot()

    tmp = ET.Element("test")
    ad = AdditionalData(tmp)
    ad.currentElement = tmp
    ad.resolutions = []

    # res = mergeSimple(leftRoot[0], rightRoot[0], ad)
    # Resolution(Step.RIGHT)
    confs, res = merge2(fileCol1, fileCol2, [], outputAsET=True)

    # res = mergeStage(leftRoot, rightRoot, ad)

    if confs:
        print([c.__str__() for c in confs])
    if res:
        print(pretty_print_xml(res))

    # print(
    #     zipMatchingNodesByAttributeForLists(
    #         leftRoot[0][0], rightRoot[0][0], "customData"
    #     )
    # )

    # treeLeft = ET.parse(filePath1)
    # treeRight = ET.parse(filePath2)

    # leftRoot = treeLeft.getroot()[2][0]
    # rightRoot = treeRight.getroot()[2][0]
    # print(zipMatchingNodesByTag(leftRoot, rightRoot))

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
