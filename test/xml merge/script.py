"""
A general purpose utility for merging XML files. Ignorant of XML schema and namespaces.
Written for use with Python2, using xml.dom.minidom
Author: Paul Barton - SavinaRoja
https://gist.github.com/SavinaRoja/5408568
adapted for Snap! projects
"""

import xml.dom.minidom as minidom
from hashlib import sha1

def element_hash(self):
    """
    Provides a means of hashing an element. This method only accounts for
    tag names and attribute-value pairs.
    It composes a string of the tag name, followed by alphabetized (by
    attribute name) attribute-value pairs. It then converts this to an integer
    for hash comparison.
    """
    hash_string = u'{0}'.format(self.tagName)
    attribute_keys = sorted(self.attributes.keys())
    for attr_key in attribute_keys:
        hash_string += u'{0}{1}'.format(attr_key, self.attributes[attr_key].value)
    return int(sha1(hash_string.encode('utf-8')).hexdigest(), 16)

def text_hash(self):
    """
    Provides a means of hashing a Text node. It just hashes the text data.
    """
    hash_string = u'{0}'.format(self.data)
    return int(sha1(hash_string.encode('utf-8')).hexdigest(), 16)

def element_hash_children(self):
    """
    Creates a dictionary of child elements; the element serving as value and
    the hash serving as the key.
    """
    child_dict = {}
    for child in self.childNodes:
        child_dict[child.custom_hash()] = child
    return child_dict

#Monkey patching some methods into xml.dom.minidom Classes
minidom.Element.custom_hash = element_hash
minidom.Element.hashedChildNodes = element_hash_children
minidom.Text.custom_hash = text_hash
minidom.Text.hashedChildNodes = {}

def xml_merge(reference_element, subject_element):
    """
    Recursively traverses a subject XML tree and a reference tree, merging the
    subject tree Elements into the reference tree if the subject Element is
    unique.
    """
    for subject_child in subject_element.childNodes:
        subject_hash = subject_child.custom_hash()
        if subject_hash in reference_element.hashedChildNodes():
            reference_child = reference_element.hashedChildNodes()[subject_hash]
            xml_merge(reference_child, subject_child)
        else:
            reference_element.appendChild(subject_child.cloneNode(deep=True))
    return

ref = minidom.parse('test1.xml')
subject = minidom.parse('test2.xml')

ref_root, subject_root = ref.documentElement, subject.documentElement

xml_merge(ref_root, subject_root)

with open('xml_merged.xml', 'w') as output:
    data = ref.toxml(encoding='utf-8')
    data = data.replace('<?xml version="1.0" encoding="utf-8"?>', '')
    output.write(data)
