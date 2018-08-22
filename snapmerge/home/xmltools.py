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


def get_first_child(ele): return ele[0] if len(ele) else None


def xml_merge(reference_element, subject_element, ref_description='', subject_description='', ancestor=None):
    """
    Recursively traverses a subject XML tree and a reference tree, merging the
    subject tree Elements into the reference tree if the subject Element is
    unique.
    """
    hashed_elements = element_hash_children(reference_element)

    ref_tag = reference_element.tag
    subject_tag = subject_element.tag

    for subject_child in list(subject_element):
        subject_hash = element_hash(subject_child)
        if subject_hash in hashed_elements:
            reference_child = hashed_elements[subject_hash]

            if ref_tag == 'scripts' and subject_tag == 'scripts' \
                    and ET.tostring(reference_child) == ET.tostring(subject_child):
                # both scripts are identical
                pass
            elif ref_tag == 'scripts' and subject_tag == 'scripts':
                # add comment
                ref_comment = '<comment collapsed = "false"' + ' w = "' + str(len(ref_description) * 3) + '" > ' + \
                        ' from post: ' + ref_description + ' </comment>'
                get_first_child(reference_child).append(ET.fromstring(ref_comment))

                subject_comment = '<comment collapsed = "false"' + ' w = "' + str(len(subject_description) * 3) + \
                                  '" >' +' from post: ' + subject_description + '</comment>'
                get_first_child(subject_child).append(ET.fromstring(subject_comment))

                # change position of subject_child so that they are not on top of each other
                x_pos = int(subject_child.get('x'))

                x_delta = 250
                duplicate = False
                found_place = False

                while not found_place:
                    for other_script in list(reference_element):
                        found_place = True
                        # script is already copied somewhere else
                        if ''.join(ET.tostring(e, 'unicode') for e in subject_child.iter()) \
                                == ''.join(ET.tostring(e, 'unicode') for e in other_script.iter()):
                            duplicate = True
                        # there is another script here
                        if int(other_script.get('x')) == x_pos + x_delta and other_script.get('y') == subject_child.get('y'):
                            found_place = False
                            x_delta += 250

                if not duplicate:
                    subject_child.set('x', str(x_pos + x_delta))
                    reference_element.append(subject_child)

            else:
                xml_merge(reference_child, subject_child, ref_description, subject_description)
        else:
            if subject_child.tag == 'sprite':
                for reference_child in list(reference_element):
                    if reference_child.tag == 'sprite' and subject_child.get('name') == reference_child.get('name'):
                        xml_merge(reference_child, subject_child, ref_description, subject_description)
                        return
                reference_element.append(subject_child)
            else:
                reference_element.append(subject_child)
    return


def merge(file1, file2, output, file1_description, file2_description, ancestor= None):
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

    if ancestor != None:
        with open(settings.BASE_DIR + ancestor ,'r') as ancestor_file:
            xml_merge(ref_root,
                      subject_root,
                      ref_description= file1_description,
                      subject_description= file2_description,
                      ancestor= ancestor_file.read()
            )
    else:
        xml_merge(ref_root, subject_root, ref_description=file1_description, subject_description=file2_description)

    with open(settings.BASE_DIR + output, 'wb') as f:
        ref.write(f)


def include_sync_button(file, proj_id, me):

    with open(settings.BASE_DIR + '/static/snap/sync_block_simple.xml', 'r') as f:
        sync_file = f.read()
        sync_file = sync_file.replace('{{url}}', settings.URL + '/sync/'+str(proj_id) + '?ancestor='+str(me))
        sync_button = ET.fromstring(sync_file)

        target = ET.parse(settings.BASE_DIR + file)
        if target.find(".//block-definition[@s='Post to smerge...']") != None:
            for block_definition in target.findall(".//blocks"):
                for sync_block in block_definition.findall(".//block-definition[@s='Post to smerge...']"):
                    block_definition.remove(sync_block)
        target.find('blocks').append(sync_button)
        with open(settings.BASE_DIR + file, 'wb') as x:
            target.write(x)


def analyze_file(file):

    ref = ET.parse(settings.BASE_DIR + file)
    root = ref.getroot()
    scripts = len(root.findall(".//script")) - 1 # without sync block
    sprites = len(root.findall(".//sprite"))
    return [scripts, sprites]