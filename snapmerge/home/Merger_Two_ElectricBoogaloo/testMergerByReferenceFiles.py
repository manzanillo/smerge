import io

from django.test import TestCase

from .merger import create_xml_head, pretty_print_xml
import xml.etree.ElementTree as ET
from .merger_v2_2 import *
import os
from parameterized import parameterized, parameterized_class
from typing import List, Tuple
from itertools import groupby, starmap

reference_file_base_path = "./snapmerge/test/snapfiles/"
reference_collision_files_base_path = reference_file_base_path + "collisions/"
reference_no_collision_files_base_path = reference_file_base_path + "no_collisions/"


def get_file_pairs(directory_path) -> List[Tuple[str, str]]:
    files = os.listdir(directory_path)
    # split files by separotor char _ from right to left
    prefix_list: List[Tuple[str, str]] = list(
        map(lambda x: (x.rsplit("_", 1)[0], x), files)
    )

    # group files by prefix
    prefix_list = sorted(prefix_list, key=lambda x: x[0])
    result = []
    prefix_list = groupby(prefix_list, lambda x: x[0])
    for _, values in prefix_list:
        values = list(values)
        result.append((values[0][1], values[1][1]))
    return result


collision_test_files = get_file_pairs(reference_collision_files_base_path)
no_collision_test_files = get_file_pairs(reference_no_collision_files_base_path)


class TestMerge(TestCase):

    # If both names and version are the same, it should return no collision and return the left
    def testCollision(self):
        left = reference_file_base_path + "mergeDifferentSteps1.xml"
        right = reference_file_base_path + "mergeDifferentSteps2.xml"
        conflict, merged = merge2(left, right)
        self.assertIsInstance(conflict[0], Conflict)
        self.assertEqual(merged is None, True)

    def testResolve(self):
        left: str = reference_file_base_path + "mergeDifferentSteps1.xml"
        right = reference_file_base_path + "mergeDifferentSteps2.xml"
        left_et = ET.parse(left).getroot()
        right_et = ET.parse(right).getroot()

        conflict_accept_left, merged_accept_left = merge2(
            left, right, resolutions=[Resolution(Step.LEFT)]
        )
        conflict_accept_right, merged_accept_right = merge2(
            left, right, resolutions=[Resolution(Step.RIGHT)]
        )

        merged_accept_left = ET.fromstring(merged_accept_left)
        merged_accept_right = ET.fromstring(merged_accept_right)

        self.assertEqual(conflict_accept_left is None, True)
        self.assertEqual(conflict_accept_right is None, True)

        self.assertEqual(compareXMLSame(merged_accept_left, left_et), True)
        self.assertEqual(compareXMLSame(merged_accept_right, right_et), True)

        self.assertNotEqual(compareXMLSame(merged_accept_left, right_et), True)
        self.assertNotEqual(compareXMLSame(merged_accept_right, left_et), True)

    @parameterized.expand(collision_test_files)
    def testCollisions(self, leftFile, rightFile):
        left = reference_collision_files_base_path + leftFile
        right = reference_collision_files_base_path + rightFile
        try:
            conflict, merged = merge2(left, right)
            self.assertIsInstance(conflict[0], Conflict)
            self.assertEqual(merged is None, True)
        except Exception as e:
            print(e)
            self.fail("Unexpected exception")

    @parameterized.expand(no_collision_test_files)
    def testNoCollisions(self, leftFile, rightFile):
        left = reference_no_collision_files_base_path + leftFile
        right = reference_no_collision_files_base_path + rightFile
        try:
            conflict, merged = merge2(left, right)
            self.assertEqual(conflict is None, True)
            self.assertNotEqual(merged, None)
        except Exception as e:
            print(e)
            self.fail("Unexpected exception")


def compareXMLSame(left, right):
    if left.tag != right.tag:
        return False
    if left.tag == "block-definition" and "Post to smerge" in left.attrib["s"]:
        return True
    if len(left) != len(right):
        return False
    if len(left) == 0:
        if left.text is None:
            left.text = ""
        if right.text is None:
            right.text = ""
        return left.text.replace("\n", "").strip() == right.text.replace(
            "\n", ""
        ).strip() and attribsSame(left, right)
    for i in range(len(left)):
        if not compareXMLSame(left[i], right[i]):
            return False
    return True


def attribsSame(left, right):
    if len(left.attrib) != len(right.attrib):
        return False
    for key, value in left.attrib.items():
        if key not in right.attrib:
            return False
        if right.attrib[key] != value:
            return False
    return True


# to run
# python -m unittest tests.py

if __name__ == "__main__":
    unittest.main()
