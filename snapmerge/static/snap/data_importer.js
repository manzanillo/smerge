SnapSerializer.prototype.loadScripts = function (object, scripts, model) {
    // private
    var scale = SyntaxElementMorph.prototype.scale;
    scripts.cachedTexture = IDE_Morph.prototype.scriptsPaneTexture;
    model.children.forEach(child => {
        var element;
        if (child.tag === 'script') {
            element = this.loadScript(child, object);
            if (!element) {
                return;
            }

            if(child.attributes["customData"]){
                element.customData = child.attributes["customData"];
				console.log(element);
            }

            element.setPosition(new Point(
                (+child.attributes.x || 0) * scale,
                (+child.attributes.y || 0) * scale
            ).add(scripts.topLeft()));
            scripts.add(element);
            element.fixBlockColor(null, true); // force zebra coloring
            element.allComments().forEach(comment => comment.align(element));
        } else if (child.tag === 'comment') {
            element = this.loadComment(child);
            if (!element) {
                return;
            }

            if(child.attributes["customData"]){
                element.customData = child.attributes["customData"];
            }

            element.setPosition(new Point(
                (+child.attributes.x || 0) * scale,
                (+child.attributes.y || 0) * scale
            ).add(scripts.topLeft()));
            scripts.add(element);
        }
    });
};

SnapSerializer.prototype.loadScriptsArray = function (model, object) {
    // private - answer an array containting the model's scripts
    var scale = SyntaxElementMorph.prototype.scale,
        scripts = [];
    model.children.forEach(child => {
        var element;
        if (child.tag === 'script') {
            element = this.loadScript(child, object);
            if (!element) {
                return;
            }

            if(child.attributes["customData"]){
                element.customData = child.attributes["customData"];
            }

            element.setPosition(new Point(
                (+child.attributes.x || 0) * scale,
                (+child.attributes.y || 0) * scale
            ));
            scripts.push(element);
            element.fixBlockColor(null, true); // force zebra coloring
        } else if (child.tag === 'comment') {
            element = this.loadComment(child);
            if (!element) {
                return;
            }

            if(child.attributes["customData"]){
                element.customData = child.attributes["customData"];
            }

            element.setPosition(new Point(
                (+child.attributes.x || 0) * scale,
                (+child.attributes.y || 0) * scale
            ));
            scripts.push(element);
        }
    });
    return scripts;
};

BlockMorph.prototype.toXML = BlockMorph.prototype.toScriptXML = function (
    serializer,
    savePosition
) {
    var position,
        xml,
        scale = SyntaxElementMorph.prototype.scale,
        block = this;
    // determine my position
    if (this.parent) {
        position = this.topLeft().subtract(this.parent.topLeft());
    } else {
        position = this.topLeft();
    }

    // save my position to xml
    if (savePosition) {
        xml = serializer.format(
            '<script x="@" y="@">',
            position.x / scale,
            position.y / scale
        );
        if (block.customData) {
            xml = serializer.format(
                '<script x="@" y="@" customData="@">',
                position.x / scale,
                position.y / scale,
                block.customData
            );
        } else {
            xml = serializer.format(
                '<script x="@" y="@">',
                position.x / scale,
                position.y / scale
            );
        }
    } else {
        xml = '<script>';
    }
    // recursively add my next blocks to xml
    do {
        xml += block.toBlockXML(serializer);
        block = block.nextBlock();
    } while (block);
    xml += '</script>';
    return xml;
};


ReporterBlockMorph.prototype.toScriptXML = function (
    serializer,
    savePosition
) {
    var position,
        scale = SyntaxElementMorph.prototype.scale;
    // determine my save-position
    if (this.parent) {
        position = this.topLeft().subtract(this.parent.topLeft());
    } else {
        position = this.topLeft();
    }

    if (savePosition) {
        if (this.customData) {
            return serializer.format(
                '<script x="@" y="@" customData="@">%</script>',
                position.x / scale,
                position.y / scale,
                this.customData,
                this.toXML(serializer)
            );
        }

        return serializer.format(
            '<script x="@" y="@">%</script>',
            position.x / scale,
            position.y / scale,
            this.toXML(serializer)
        );
    }
    return serializer.format('<script>%</script>', this.toXML(serializer));
};

CommentMorph.prototype.toXML = function (serializer) {
    var position,
        scale = SyntaxElementMorph.prototype.scale;
    if (this.block) { // attached to a block
        return serializer.format(
            '<comment w="@" collapsed="@">%</comment>',
            this.textWidth() / scale,
            this.isCollapsed,
            serializer.escape(this.text())
        );
    }
    // free-floating, determine my save-position
    if (this.parent) {
        position = this.topLeft().subtract(this.parent.topLeft());
    } else {
        position = this.topLeft();
    }

    if (this.customData) {
        return serializer.format(
            '<comment x="@" y="@" w="@" collapsed="@" customData="@">%</comment>',
            position.x / scale,
            position.y / scale,
            this.textWidth() / scale,
            this.isCollapsed,
            this.customData,
            serializer.escape(this.text())
        );
    }

    return serializer.format(
        '<comment x="@" y="@" w="@" collapsed="@">%</comment>',
        position.x / scale,
        position.y / scale,
        this.textWidth() / scale,
        this.isCollapsed,
        serializer.escape(this.text())
    );
};


loadFile();
world.children[0].setBlocksScale(1);

async function loadFile () {
  var res = await fetch("{{url}}");
  var xml = await res.text();
  var ide = window.world.root().children[0];
  ide.loadProjectXML(xml)
}