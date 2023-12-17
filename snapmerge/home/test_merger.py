from django.test import TestCase, RequestFactory
from django.test.client import Client
from django.db import models

from .Merger_Two_ElectricBoogaloo.generator import create_xml_head, pretty_print_xml, copyElement
import xml.etree.ElementTree as ET
from .Merger_Two_ElectricBoogaloo.merger import *

# to run
# python manage.py test --settings=config.settings_test

# class TestMisc(TestCase):
#     # If both names and version are the same, it should return no collision and return the left
#     def testCollision(self):
#         node = SnapScript().generate()
#         original = copyElement(node)
        
#         changes = SnapScript.alterBlocks(node)
#         conflicts = mergeScripts(original, node)
        
#         if len(conflicts) != changes:
#             print(f"# of changes: {changes}")
#             print("Original:")
#             print(pretty_print_xml(original))
#             print("Changed:")
#             print(pretty_print_xml(node))
#             print("Conflicts:")
#             for con in conflicts:
#                 print(str(con))
#         self.assertEqual(len(conflicts), changes)
        

def printOrigNew(original: ET.Element, diff: ET.Element):
    if original:
        print("Orig:")
        print(pretty_print_xml(original))
    if diff:
        print("Differ:")
        print(pretty_print_xml(diff))
        

class TestSnapFile(TestCase):
    def testMergerWithScriptDiffer(self):
        tmp = SnapFileGenerator(projectName="project", appName="Snap! 9.0, https://snap.berkeley.edu")
        tmp.addScene(SnapScene("test"))
        # tmp.addScene(SnapScene("tes2"))
        snap = tmp.generate()
        original = copyElement(snap)
        SnapFileGenerator.alterScripts(snap)
        
        with open("/tmp/snap_test_file_orig.xml", "w") as f:
            f.write(pretty_print_xml(original))
        with open("/tmp/snap_test_file_altered.xml", "w") as f:
            f.write(pretty_print_xml(snap))
        
        res = merge("/tmp/snap_test_file_orig.xml", "/tmp/snap_test_file_altered.xml")
        print(str(res[0][0]))


class TestScriptsMerge(TestCase):
    def testScriptAltered(self):
        scripts = SnapScripts()
        node = scripts.generate(scriptAmount=2)
        
        original = copyElement(node)
        SnapScripts.alterScripts(node)
        
        resSame = mergeScripts(original, node)
        
        if type(resSame) != list:
            printOrigNew(original, node)
        self.assertTrue(type(resSame) == list)
        
    def testScriptNew(self):
        scripts = SnapScripts()
        node = scripts.generate(scriptAmount=2)
        
        newScripts = SnapScripts()
        newNode = newScripts.generate(scriptAmount=2)
        
        resSame = mergeScripts(node, newNode)
        
        if resSame != None:
            printOrigNew(node, newNode)
        self.assertIsNone(resSame)
        
    def testScriptSame(self):
        scripts = SnapScripts()
        node = scripts.generate(scriptAmount=2)
        
        resSame = mergeScripts(node, node)
        
        if resSame != None:
            printOrigNew(node, None)
        self.assertIsNone(resSame)
            

        
    
class TestCompareCustomDataNodes(TestCase):
    def testSame(self):
        for i in range(0,5):
            node = SnapScript().generate()
            original = copyElement(node)
            
            changes = SnapScript.alterBlocks(node)
            resSame = compareCustomDataNodes(original, original)
            resDiff = compareCustomDataNodes(original, node)
            
            if not resSame:
                print(pretty_print_xml(original))
            self.assertTrue(resSame)
            
            if resDiff:
                printOrigNew(original, node)
            self.assertFalse(resDiff)
            
    def testPositionChange(self):
        node = SnapScript().generate()
        original = copyElement(node)
        
        changes = SnapScript.alterPos(node)
        resDiff = compareCustomDataNodes(original, node)
        
        if not resDiff:
            printOrigNew(original, node)
        self.assertTrue(resDiff)
        



# class TestMergeDoc(TestCase):
#     # If both names and version are the same, it should return no collision and return the left
#     def testCollision(self):
#         projectName = "project"
#         versionName = "Snap! 9.0, https://snap.berkeley.edu"
#         xml1 = create_xml_head(projectName, versionName, asTree=True).getroot()
#         xml2 = create_xml_head(projectName, versionName, asTree=True).getroot()
#         conflict, merged = mergeDoc(xml1, xml2)
#         self.assertEqual(conflict, None)
#         self.assertEqual(merged, xml1)
                
#     # If both names and version are the same, it should return no collision and return the left
#     def testCollisionVersion(self):
#         projectName = "project"
#         versionName = "Snap! 9.0, https://snap.berkeley.edu"
#         versionName2 = "Snap! 9.0.1, https://snap.berkeley.edu"
#         xml1 = create_xml_head(projectName, versionName, asTree=True).getroot()
#         xml2 = create_xml_head(projectName, versionName2, asTree=True).getroot()
#         conflict, merged = mergeDoc(xml1, xml2)
#         self.assertEqual(conflict, None)
#         self.assertEqual(merged, xml2)
        
#     def testConflict(self):
#         projectName = "project"
#         projectName2 = "project_false"
#         versionName = "Snap! 9.0, https://snap.berkeley.edu"
#         xml1 = create_xml_head(projectName, versionName, asTree=True).getroot()
#         xml2 = create_xml_head(projectName2, versionName, asTree=True).getroot()
#         conflict, merged = mergeDoc(xml1, xml2)
#         self.assertEqual(str(conflict), "Conflict (Text): project <-> project_false")
#         self.assertEqual(merged, xml1)
        
#     def testConflict(self):
#         projectName = "project"
#         projectName2 = "project_false"
#         versionName = "Snap! 9.0, https://snap.berkeley.edu"
#         xml1 = create_xml_head(projectName, versionName, asTree=True).getroot()
#         xml2 = create_xml_head(projectName2, versionName, asTree=True).getroot()
#         conflict, merged = mergeDoc(xml1, xml2, resolutions=[Resolution(Step.RIGHT)])
#         self.assertEqual(conflict, None)
#         self.assertEqual(merged, xml1)
#         self.assertNotEqual(merged, xml2)
        
        
        
        
        
    # def setUp(self):
    # # Perform setup actions here, if needed

    # def tearDown(self):
    #     # Perform cleanup actions here, if needed

# class TestAtomicMerge(TestCase):
#     def testSame(self):
#         tagLeft = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
#         tagRight = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
#         conflict, merged = atomicMerge(tagLeft, tagRight)
#         self.assertEqual(conflict, None)
#         self.assertEqual(merged, tagLeft)
        
#     def testDifferentTag(self):
#         tagLeft = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
#         tagRight = ET.Element('projects', {'name': "tmp", 'app': "123", 'version': '2'})
#         conflict, merged = atomicMerge(tagLeft, tagRight)
#         self.assertEqual(type(conflict), type(Conflict("","")))
#         self.assertEqual(merged, None)
        
#     def testDifferentAttribs(self):
#         tagLeft = ET.Element('project', {'name': "tmp", 'app': "123", 'version': '2'})
#         tagRight = ET.Element('project', {'name': "tmp", 'app': "123"})
#         conflict, merged = atomicMerge(tagLeft, tagRight)
#         self.assertEqual(type(conflict), type(Conflict("","")))
#         self.assertEqual(merged, None)
        
#     def testDifferentAttribValues(self):
#         tagLeft = ET.Element('project', {'name': "tmp", 'app': "1"})
#         tagRight = ET.Element('project', {'name': "tmp", 'app': "123"})
#         conflict, merged = atomicMerge(tagLeft, tagRight)
#         self.assertEqual(type(conflict), type(Conflict("","")))
#         self.assertEqual(merged, None)