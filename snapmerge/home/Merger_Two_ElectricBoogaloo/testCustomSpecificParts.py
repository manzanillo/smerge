import io

from django.test import TestCase

from .merger import create_xml_head, pretty_print_xml
import xml.etree.ElementTree as ET
from .merger_v2_2 import *
import os
from typing import List, Tuple

reference_file_base_path = "./snapmerge/test/snapfiles/"


class TestSpecifics(TestCase):
    def testMultiCostumeRemain(self):
        left = reference_file_base_path + "mergeMultiCostumes_1.xml"
        right = reference_file_base_path + "mergeMultiCostumes_2.xml"
        conflict, merged = merge2(left, right)
        self.assertEqual(conflict is None, True)

        mergedRoot = ET.fromstring(merged)
        sprites = mergedRoot.findall(
            ".//sprite[@customData='ef0132be-bdd6-4db3-924c-c727f74e73ea']"
        )
        self.assertEqual(len(sprites), 1)
        costumeList = sprites[0].find(".//costumes")
        self.assertEqual(len(costumeList[0]), 6)

    def testMultiAudiosRemain(self):
        left = reference_file_base_path + "mergeMultiAudio_1.xml"
        right = reference_file_base_path + "mergeMultiAudio_2.xml"
        conflict, merged = merge2(left, right)
        self.assertEqual(conflict is None, True)

        mergedRoot = ET.fromstring(merged)
        sprites = mergedRoot.findall(
            ".//sprite[@customData='ef0132be-bdd6-4db3-924c-c727f74e73ea']"
        )
        self.assertEqual(len(sprites), 1)
        audioList = sprites[0].find(".//sounds")
        self.assertEqual(len(audioList[0]), 3)

    def testMultiLocalVarsRemain(self):
        left = reference_file_base_path + "mergeMultiLocalVars_1.xml"
        right = reference_file_base_path + "mergeMultiLocalVars_2.xml"
        conflict, merged = merge2(left, right)
        self.assertEqual(conflict is None, True)

        mergedRoot = ET.fromstring(merged)
        sprites = mergedRoot.findall(
            ".//sprite[@customData='ef0132be-bdd6-4db3-924c-c727f74e73ea']"
        )
        self.assertEqual(len(sprites), 1)
        varsList = sprites[0].find(".//variables")
        self.assertEqual(len(varsList), 2)

    def testMultiMixVarsRemain(self):
        left = reference_file_base_path + "mergeMultiVarsMix_1.xml"
        right = reference_file_base_path + "mergeMultiVarsMix_2.xml"
        conflict, merged = merge2(left, right)
        self.assertEqual(conflict is None, True)

        mergedRoot = ET.fromstring(merged)
        sprites = mergedRoot.findall(
            ".//sprite[@customData='ef0132be-bdd6-4db3-924c-c727f74e73ea']"
        )
        self.assertEqual(len(sprites), 1)
        varsList = sprites[0].find(".//variables")
        self.assertEqual(len(varsList), 1)
        allVars = mergedRoot.findall(".//variable")
        self.assertEqual(len(allVars), 2)

    def testNewSceneAdd(self):
        left = reference_file_base_path + "mergeExtraScene_1.xml"
        right = reference_file_base_path + "mergeExtraScene_2.xml"
        conflict, merged = merge2(left, right)
        self.assertEqual(conflict is None, True)

        mergedRoot = ET.fromstring(merged)
        scenes = mergedRoot.find(".//scenes")
        self.assertEqual(len(scenes), 2)
