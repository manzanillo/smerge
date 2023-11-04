import unittest
from generator import pretty_print_xml, create_xml_head

from merger import mergeDoc

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)
            
class TestMergeDoc(unittest.TestCase):
    # If both names and version are the same, it should return no collision and return the left
    def testCollision(self):
        projectName = "project"
        versionName = "Snap! 9.0, https://snap.berkeley.edu"
        xml1 = create_xml_head(projectName, versionName, asTree=True).getroot()
        xml2 = create_xml_head(projectName, versionName, asTree=True).getroot()
        conflict, merged = mergeDoc(xml1, xml2)
        self.assertEqual(conflict, None)
        self.assertEqual(merged, xml1)

if __name__ == '__main__':
    unittest.main()