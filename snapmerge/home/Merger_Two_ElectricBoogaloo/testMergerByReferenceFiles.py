import io

from django.test import TestCase
from .merger import create_xml_head, pretty_print_xml
import xml.etree.ElementTree as ET
from .merger import *
import os

reference_file_base_path = "./snapmerge/test/snapfiles/"


class TestMerge(TestCase):
    # If both names and version are the same, it should return no collision and return the left
    def testCollision(self):
        left = reference_file_base_path + "mergeDifferentSteps1.xml"
        right = reference_file_base_path + "mergeDifferentSteps2.xml"
        conflict, merged = merge(left, right)
        self.assertIsInstance(conflict[0], Conflict)
        self.assertEqual(merged is None, True)

    def testResolve(self):
        left: str = reference_file_base_path + "mergeDifferentSteps1.xml"
        right = reference_file_base_path + "mergeDifferentSteps2.xml"
        left_et = ET.tostring(ET.parse(left).getroot(), encoding="utf-8")
        right_et = ET.tostring(ET.parse(right).getroot(), encoding="utf-8")

        conflict_accept_left, merged_accept_left = merge(left, right, resolutions=[Resolution(Step.LEFT)])
        conflict_accept_right, merged_accept_right = merge(left, right, resolutions=[Resolution(Step.RIGHT)])

        self.assertEqual(conflict_accept_left is None, True)
        self.assertEqual(conflict_accept_right is None, True)

        self.assertEqual(merged_accept_left, left_et)
        self.assertEqual(merged_accept_right, right_et)

        self.assertNotEqual(merged_accept_left, right_et)
        self.assertNotEqual(merged_accept_right, left_et)


# to run
# python -m unittest tests.py

if __name__ == '__main__':
    unittest.main()
