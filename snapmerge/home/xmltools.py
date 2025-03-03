import xml.etree.ElementTree as ET
from hashlib import sha1
import os
from django.conf import settings
import uuid


def element_hash(ele):
    """
    Provides a means of hashing an element. This method only accounts for
    tag names and attribute-value pairs.
    It composes a string of the tag name, followed by alphabetized (by
    attribute name) attribute-value pairs. It then converts this to an integer
    for hash comparison.
    """
    hash_string = "{0}".format(ele.tag)
    if ele.tag == "sprite":
        attribute_keys = ele.get("name")
    else:
        attribute_keys = sorted(ele.keys())

    for attr_key in attribute_keys:
        if attr_key == "x" or attr_key == "y":
            hash_string += "{0}{1}".format(attr_key, round(float(ele.get(attr_key))))
        else:
            hash_string += "{0}{1}".format(attr_key, ele.get(attr_key))

    return int(sha1(hash_string.encode("utf-8")).hexdigest(), 16)


def element_hash_children(ele):
    """
    Creates a dictionary of child elements; the element serving as value and
    the hash serving as the key.
    """
    child_dict = {}
    for child in list(ele):
        child_dict[element_hash(child)] = child
    return child_dict


def get_first_child(ele):
    return ele[0] if len(ele) else None


def xml_merge(
    reference_element,
    subject_element,
    ref_description="",
    subject_description="",
    ancestor=None,
):
    """
    Recursively traverses a subject XML tree and a reference tree, merging the
    subject tree Elements into the reference tree if the subject Element is
    unique.
    """
    hashed_elements = element_hash_children(reference_element)

    #    print(subject_child.tag, subject_child.attrib)
    ref_tag = reference_element.tag
    subject_tag = subject_element.tag

    for subject_child in list(subject_element):
        subject_hash = element_hash(subject_child)

        if subject_child.tag == "costumes" or subject_child.tag == "sounds":
            for reference_child in list(reference_element):
                if (
                    subject_child.tag == "costumes"
                    and reference_child.tag == "costumes"
                ):
                    # costumes are only allowed to have one list containg items containg costumes
                    xml_merge_props(reference_child, subject_child, "costumes")
                elif subject_child.tag == "sounds" and reference_child.tag == "sounds":
                    xml_merge_props(reference_child, subject_child, "sounds")

        elif subject_hash in hashed_elements:
            reference_child = hashed_elements[subject_hash]

            # deal with similar coordinates
            if "x" in reference_child.attrib and "x" in subject_child.attrib:
                reference_child.set("x", str(round(float(reference_child.get("x")))))
                reference_child.set("y", str(round(float(reference_child.get("y")))))
                subject_child.set("x", str(round(float(subject_child.get("x")))))
                subject_child.set("y", str(round(float(subject_child.get("y")))))

            if (
                ref_tag == "scripts"
                and subject_tag == "scripts"
                and ET.tostring(reference_child) == ET.tostring(subject_child)
            ):
                # both scripts are identical
                pass
            elif ref_tag == "scripts" and subject_tag == "scripts":

                if ancestor is not None and ET.tostring(reference_child) in ET.tostring(
                    ancestor
                ):
                    reference_element.remove(reference_child)
                    reference_element.append(subject_child)
                else:
                    # add comment
                    ref_comment = (
                        '<comment collapsed = "false"'
                        + ' w = "'
                        + str(len(ref_description) * 3)
                        + '" > '
                        + " from post: "
                        + ref_description
                        + " </comment>"
                    )

                    if reference_child.tag != "comment":
                        get_first_child(reference_child).append(
                            ET.fromstring(ref_comment)
                        )

                    subject_comment = (
                        '<comment collapsed = "false"'
                        + ' w = "'
                        + str(len(subject_description) * 3)
                        + '" >'
                        + " from post: "
                        + subject_description
                        + "</comment>"
                    )
                    if reference_child.tag != "comment":
                        get_first_child(subject_child).append(
                            ET.fromstring(subject_comment)
                        )

                    # change position of subject_child so that they are not on top of each other
                    x_pos = int(float(subject_child.get("x")))

                    x_delta = 250
                    duplicate = False
                    found_place = False

                    while not found_place:
                        for other_script in list(reference_element):
                            found_place = True
                            # script is already copied somewhere else
                            if "".join(
                                ET.tostring(e, "unicode") for e in subject_child.iter()
                            ) == "".join(
                                ET.tostring(e, "unicode") for e in other_script.iter()
                            ):
                                duplicate = True
                            # there is another script here
                            if int(
                                float(other_script.get("x"))
                            ) == x_pos + x_delta and other_script.get(
                                "y"
                            ) == subject_child.get(
                                "y"
                            ):
                                found_place = False
                                x_delta += 250

                    if not duplicate:
                        subject_child.set("x", str(x_pos + x_delta))
                        reference_element.append(subject_child)

                    # the files have a common ancestor

            else:
                xml_merge(
                    reference_child,
                    subject_child,
                    ref_description,
                    subject_description,
                    ancestor,
                )
        else:
            # there is a difference
            if subject_child.tag == "stage":
                for reference_child in list(reference_element):
                    if reference_child.tag == "stage":
                        # we are only allowed to have one stage
                        xml_merge(
                            reference_child,
                            subject_child,
                            ref_description,
                            subject_description,
                            ancestor,
                        )
                        different_name_of_stage_comment = (
                            '<comment collapsed = "false"'
                            + ' w = "150" >'
                            + " other stage name was: "
                            + subject_child.get("name")
                            + "</comment>"
                        )
                        reference_child.find("scripts").append(
                            ET.fromstring(different_name_of_stage_comment)
                        )
            elif subject_child.tag == "watcher":
                already_exists = False
                for reference_child in list(reference_element):
                    if reference_child.tag == "watcher" and subject_child.get(
                        "var"
                    ) == reference_child.get("var"):
                        already_exists = True
                if not already_exists:
                    reference_element.append(subject_child)
            elif subject_child.tag == "sprite":
                for reference_child in list(reference_element):
                    if reference_child.tag == "sprite" and subject_child.get(
                        "name"
                    ) == reference_child.get("name"):
                        xml_merge(
                            reference_child,
                            subject_child,
                            ref_description,
                            subject_description,
                            ancestor,
                        )
                reference_element.append(subject_child)
            else:
                reference_element.append(subject_child)
    return


def xml_merge_props(reference_element, subject_element, type="costumes"):
    data_type = "image"
    if type == "sounds":
        data_type = "sound"
    props_into = reference_element[0]  # 'list'
    props_from = subject_element[0]  # 'list'
    if props_from.get("struct") == "atomic":
        return
    if props_into.get("struct") == "atomic":
        reference_element.remove(props_into)
        reference_element.append(props_from)
    else:
        # we need to merge the two lists
        # first: collect image data from into:
        prop_data = []
        for prop in props_into:
            prop_data.append(prop[0].get(data_type))

        # now iterate over props_from and append missing ones to props into
        for prop in props_from:
            if prop[0].get(data_type) not in prop_data:
                props_into.append(prop)


def merge(file1, file2, output, file1_description, file2_description, ancestor=None):
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

    if ancestor is not None:

        ancestor = ET.parse(settings.BASE_DIR + ancestor)
        ancestor_root = ancestor.getroot()
        xml_merge(
            ref_root,
            subject_root,
            ref_description=file1_description,
            subject_description=file2_description,
            ancestor=ancestor_root,
        )
    else:
        xml_merge(
            ref_root,
            subject_root,
            ref_description=file1_description,
            subject_description=file2_description,
        )

    with open(settings.BASE_DIR + output, "wb") as f:
        ref.write(f)


def include_sync_button(file, proj_id, me):
    with open(settings.BASE_DIR + "/static/snap/simple_sync_block.xml", "r") as f:
        sync_file = f.read()
        sync_file = sync_file.replace(
            "{{url}}",
            settings.POST_BACK_URL + "/sync/" + str(proj_id) + "?ancestor=" + str(me),
        )
        sync_button = ET.fromstring(sync_file)

        target = ET.parse(settings.BASE_DIR + file)

        # the duplicate action / button in snap can duplicate uuids, so we need to clean up the file before continuing
        cleanDupedIds(target)

        # adds uid to each script element that does not have an id already
        all_current_ids = get_all_ids(target)
        wantedTags = [
            "script",
            "block-definition",
            "scene",
            "stage",
            "sprite",
            "costume",
            "sound",
            "project",
        ]
        for tag in wantedTags:
            if tag == "project":
                if "customData" in target.getroot().keys():
                    continue
                new_uid = get_uid(all_current_ids)
                target.getroot().attrib["customData"] = get_uid(all_current_ids)
                all_current_ids.append(new_uid)
                continue
            for script_tag in target.findall(f".//{tag}"):
                if tag == "project":
                    print(script_tag)
                keys = script_tag.keys()
                if "customData" in keys:
                    # print("found")
                    pass
                elif len(keys) > 0:
                    new_uid = get_uid(all_current_ids)
                    script_tag.attrib["customData"] = get_uid(all_current_ids)
                    all_current_ids.append(new_uid)

        if target.find(".//block-definition[@s='Post to smerge...']") != None:
            for scenes in target.findall(".//scene"):
                for blocks in scenes.findall("blocks"):
                    for sync_block in blocks.findall(
                        "block-definition[@s='Post to smerge...']"
                    ):
                        blocks.remove(sync_block)
        for scenes in target.findall(".//scene"):
            scenes.find("blocks").append(sync_button)
        with open(settings.BASE_DIR + file, "wb") as x:
            target.write(x)


def get_all_ids(tree) -> list[str]:
    """collects all ids from the given tags in the tree

    @param tree:
    @return: a list of all ids within the project file
    """
    ret = []
    for script_tag in tree.findall(".//script"):
        keys = script_tag.keys()
        if "customData" in keys:
            ret.append(script_tag.attrib["customData"])
    return ret


def cleanDupedIds(tree):
    """removes all duplicate ids from the given tree

    @param tree:
    @return: the cleaned tree
    """
    # find all tags with the customData attribute in the element tree
    ids = []
    for found in tree.findall(".//*[@customData]"):
        if found.attrib["customData"] in ids:
            found.attrib["customData"] = get_uid(ids)
        else:
            ids.append(found.attrib["customData"])


def get_uid(allocated):
    """
    generates a random id unique to the allocated list
    @param allocated:
    @return:
    """
    c = 0
    while c < 100:
        new_id = uuid.uuid4()
        if new_id in allocated:
            c += 1
            continue
        else:
            return str(new_id)
    # if (with a very big if...) 100 attempts to find a unique id have failed, generate a time and system based one as fallback... should work
    return str(uuid.uuid1())


def create_dummy_file(file_name: str, host: str) -> str:
    """
    Creates a dummy file in the media folder that loads the real project
    :param file_name: the name of the file to be loaded
    :return: the dummy file with project loading block
    """
    with open(
        settings.BASE_DIR + "/static/snap/data_importer.xml", "r"
    ) as dummy_template:
        cImport_blank_data: str = dummy_template.read()
        url = host
        # quick fix to make link agnostic to server location...
        # if ".org" in url:
        #     url = url.replace('http', 'https')
        cImport_blank_data = cImport_blank_data.replace(
            "{{url}}", f"{url}/media/{file_name}"
        )
        return cImport_blank_data


def analyze_file(file):
    ref = ET.parse(settings.BASE_DIR + file)
    root = ref.getroot()
    scripts = len(root.findall(".//script")) - 1  # without sync block
    sprites = len(root.findall(".//sprite"))
    return [scripts, sprites]
