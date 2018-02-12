import xml.etree.ElementTree as ET
from hashlib import sha1
import os
from django.conf import settings


def element_hash(ele):
    """
    Provides a means of hashing an element. This method only accounts for
    tag names and attribute-value pairs.
    It composes a string of the tag name, followed by alphabetized (by
    attribute name) attribute-value pairs. It then converts this to an integer
    for hash comparison.
    """
    hash_string = u'{0}'.format(ele.tag)
    print(ele)
    attribute_keys = sorted(ele.keys())
    for attr_key in attribute_keys:
        hash_string += u'{0}{1}'.format(attr_key, ele.get(attr_key))
    return int(sha1(hash_string.encode('utf-8')).hexdigest(), 16)


def element_hash_children(ele):
    """
    Creates a dictionary of child elements; the element serving as value and
    the hash serving as the key.
    """
    child_dict = {}
    for child in list(ele):
        child_dict[element_hash(child)] = child
    return child_dict


def xml_merge(reference_element, subject_element):
    """
    Recursively traverses a subject XML tree and a reference tree, merging the
    subject tree Elements into the reference tree if the subject Element is
    unique.
    """
    hashed_elements = element_hash_children(reference_element)

    for subject_child in list(subject_element):
        subject_hash = element_hash(subject_child)
        if subject_hash in hashed_elements:
            reference_child = hashed_elements[subject_hash]
            xml_merge(reference_child, subject_child)
        else:
            reference_element.append(subject_child)
    return


def merge(file1, file2, output):
    """
    
    :param file1: first XML document path
    :param file2: second XML document path
    :param output: output path for newly created XML document
    :return: 
    """
    ref = ET.parse(settings.BASE_DIR + file1)
    ref_root = ref.getroot()
    subject = ET.parse(settings.BASE_DIR + file2)
    subject_root = subject.getroot()
    xml_merge(ref_root, subject_root)
    ref.write(open(settings.BASE_DIR + output, 'wb'))


def include_sync_button(file, proj_id, ancestor):

    sync_file = open(settings.BASE_DIR + '/static/snap/sync.xml', 'r').read()
    sync_file = sync_file.replace('{{url}}', 'urlhier/sync'+str(proj_id) + '?ancestor='+str(ancestor)) #TODO: URL aus settings holen
    sync_button = ET.fromstring(sync_file)
    target = ET.parse(settings.BASE_DIR + file)
    target.find('blocks').append(sync_button)
    target.write(open(settings.BASE_DIR + file, 'wb'))

