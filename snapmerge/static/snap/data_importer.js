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



// extensions for, block-definition, scene, stage, sprite, costume, sound, project...
SnapSerializer.prototype.loadCustomBlocks = function (
    object,
    element,
    isGlobal,
    isDispatch
) {
    // private
    element.children.forEach(child => {
        var definition, names, inputs, vars, header, code, trans, comment, i;
        if (child.tag !== 'block-definition') {
            return;
        }
        definition = new CustomBlockDefinition(
            child.attributes.s || '',
            object
        );
        // add custom data def. if available
        if(child.attributes["customData"]){
            definition.customData = child.attributes["customData"];
        }
        definition.category = child.attributes.category || 'other';
        if (!SpriteMorph.prototype.allCategories().includes(
            definition.category
        )) {
            definition.category = 'other';
        }
        definition.type = child.attributes.type || 'command';
        definition.isHelper = (child.attributes.helper === 'true') || false;
        definition.isGlobal = (isGlobal === true);
        if (isDispatch) {
            object.inheritedMethodsCache.push(definition);
        } else {
            if (definition.isGlobal) {
                object.globalBlocks.push(definition);
            } else {
                object.customBlocks.push(definition);
            }
        }

        names = definition.parseSpec(definition.spec).filter(
            str => str.charAt(0) === '%' && str.length > 1
        ).map(str => str.substr(1));

        definition.names = names;
        inputs = child.childNamed('inputs');
        if (inputs) {
            i = -1;
            inputs.children.forEach(child => {
                var options = child.childNamed('options');
                if (child.tag !== 'input') {
                    return;
                }
                i += 1;
                definition.declarations.set(
                    names[i],
                    [
                        child.attributes.type,
                        contains(['%b', '%boolUE'], child.attributes.type) ?
                            (child.contents ? child.contents === 'true' : null)
                                : child.contents,
                        options ? options.contents : undefined,
                        child.attributes.readonly === 'true',
                        child.attributes.irreplaceable === 'true',
                        child.attributes.separator
                    ]
                );
            });
        }

        vars = child.childNamed('variables');
        if (vars) {
            definition.variableNames = this.loadValue(
                vars.require('list')
            ).asArray();
        }

        header = child.childNamed('header');
        if (header) {
            definition.codeHeader = header.contents;
        }

        code = child.childNamed('code');
        if (code) {
            definition.codeMapping = code.contents;
        }

        trans = child.childNamed('translations');
        if (trans) {
            definition.updateTranslations(trans.contents);
        }

        comment = child.childNamed('comment');
        if (comment) {
            definition.comment = this.loadComment(comment);
        }
    });
};

CustomBlockDefinition.prototype.toXML = function (serializer) {
    function encodeScripts(array) {
        return array.reduce((xml, element) => {
            if (element instanceof BlockMorph) {
                return xml + element.toScriptXML(serializer, true);
            }
            if (element instanceof CommentMorph && !element.block) {
                return xml + element.toXML(serializer);
            }
            return xml;
        }, '');
    }

    if (this.customData) {
        return serializer.format(
            '<block-definition s="@" type="@" category="@" customData="@"%>' +
                '%' +
                (this.variableNames.length ? '<variables>%</variables>' : '@') +
                '<header>@</header>' +
                '<code>@</code>' +
                '<translations>@</translations>' +
                '<inputs>%</inputs>%%' +
                '</block-definition>',
            this.spec,
            this.type,
            this.category || 'other',
            this.customData,
            this.isHelper ? ' helper="true"' : '',
            this.comment ? this.comment.toXML(serializer) : '',
            (this.variableNames.length ?
                    serializer.store(new List(this.variableNames)) : ''),
            this.codeHeader || '',
            this.codeMapping || '',
            this.translationsAsText(),
            Array.from(this.declarations.keys()).reduce((xml, decl) => {
                // to be refactored now that we've moved to ES6 Map:
                    return xml + serializer.format(
                        '<input type="@"$$$>$%</input>',
                        this.declarations.get(decl)[0],
                        this.declarations.get(decl)[3] ?
                                ' readonly="true"' : '',
                        this.declarations.get(decl)[4] ?
                                ' irreplaceable="true"' : '',
                        this.declarations.get(decl)[5] ?
                                ' separator="' +
                                    this.declarations.get(decl)[5] +
                                    '"'
                                : '',
                        this.declarations.get(decl)[1],
                        this.declarations.get(decl)[2] ?
                                serializer.format(
                                    '<options>@</options>',
                                    this.declarations.get(decl)[2]
                                ) : ''
                    );
                }, ''),
            this.body ? serializer.store(this.body.expression) : '',
            this.scripts.length > 0 ?
                        '<scripts>' + encodeScripts(this.scripts) + '</scripts>'
                            : ''
        );
    }

    return serializer.format(
        '<block-definition s="@" type="@" category="@"%>' +
            '%' +
            (this.variableNames.length ? '<variables>%</variables>' : '@') +
            '<header>@</header>' +
            '<code>@</code>' +
            '<translations>@</translations>' +
            '<inputs>%</inputs>%%' +
            '</block-definition>',
        this.spec,
        this.type,
        this.category || 'other',
        this.isHelper ? ' helper="true"' : '',
        this.comment ? this.comment.toXML(serializer) : '',
        (this.variableNames.length ?
                serializer.store(new List(this.variableNames)) : ''),
        this.codeHeader || '',
        this.codeMapping || '',
        this.translationsAsText(),
        Array.from(this.declarations.keys()).reduce((xml, decl) => {
            // to be refactored now that we've moved to ES6 Map:
                return xml + serializer.format(
                    '<input type="@"$$$>$%</input>',
                    this.declarations.get(decl)[0],
                    this.declarations.get(decl)[3] ?
                            ' readonly="true"' : '',
                    this.declarations.get(decl)[4] ?
                            ' irreplaceable="true"' : '',
                    this.declarations.get(decl)[5] ?
                            ' separator="' +
                                this.declarations.get(decl)[5] +
                                '"'
                            : '',
                    this.declarations.get(decl)[1],
                    this.declarations.get(decl)[2] ?
                            serializer.format(
                                '<options>@</options>',
                                this.declarations.get(decl)[2]
                            ) : ''
                );
            }, ''),
        this.body ? serializer.store(this.body.expression) : '',
        this.scripts.length > 0 ?
                    '<scripts>' + encodeScripts(this.scripts) + '</scripts>'
                        : ''
    );
};

Scene.prototype.toXML = function (serializer) {
    var xml;

    function code(key) {
        var str = '';
        Object.keys(StageMorph.prototype[key]).forEach(
            selector => {
                str += (
                    '<' + selector + '>' +
                        XML_Element.prototype.escape(
                            StageMorph.prototype[key][selector]
                        ) +
                        '</' + selector + '>'
                );
            }
        );
        return str;
    }

    serializer.scene = this; // keep the order of sprites in the corral

    if(this.customData){
        xml = serializer.format(
            '<scene name="@" customData="@"%%%%%%>' +
                '<notes>$</notes>' +
                '%' +
                '<hidden>$</hidden>' +
                '<headers>%</headers>' +
                '<code>%</code>' +
                '<blocks>%</blocks>' +
                '%' + // stage
                '<variables>%</variables>' +
                '</scene>',
            this.name || localize('Untitled'),
            this.customData,
            this.unifiedPalette ? ' palette="single"' : '',
            this.unifiedPalette && !this.showCategories ?
                ' categories="false"' : '',
            this.unifiedPalette && !this.showPaletteButtons ?
                ' buttons="false"' : '',
            this.disableClickToRun ? ' clickrun="false"' : '',
            this.disableDraggingData ? ' dragdata="false"' : '',
            this.penColorModel === 'hsl' ? ' colormodel="hsl"' : '',
            this.notes || '',
            serializer.paletteToXML(this.customCategories),
            Object.keys(this.hiddenPrimitives).reduce(
                    (a, b) => a + ' ' + b,
                    ''
                ),
            code('codeHeaders'),
            code('codeMappings'),
            serializer.store(this.stage.globalBlocks),
            serializer.store(this.stage),
            serializer.store(this.globalVariables)
        );
    } else {
        xml = serializer.format(
            '<scene name="@"%%%%%%>' +
                '<notes>$</notes>' +
                '%' +
                '<hidden>$</hidden>' +
                '<headers>%</headers>' +
                '<code>%</code>' +
                '<blocks>%</blocks>' +
                '%' + // stage
                '<variables>%</variables>' +
                '</scene>',
            this.name || localize('Untitled'),
            this.unifiedPalette ? ' palette="single"' : '',
            this.unifiedPalette && !this.showCategories ?
                ' categories="false"' : '',
            this.unifiedPalette && !this.showPaletteButtons ?
                ' buttons="false"' : '',
            this.disableClickToRun ? ' clickrun="false"' : '',
            this.disableDraggingData ? ' dragdata="false"' : '',
            this.penColorModel === 'hsl' ? ' colormodel="hsl"' : '',
            this.notes || '',
            serializer.paletteToXML(this.customCategories),
            Object.keys(this.hiddenPrimitives).reduce(
                    (a, b) => a + ' ' + b,
                    ''
                ),
            code('codeHeaders'),
            code('codeMappings'),
            serializer.store(this.stage.globalBlocks),
            serializer.store(this.stage),
            serializer.store(this.globalVariables)
        );
    }
    return xml;
};

SnapSerializer.prototype.loadScene = function (xmlNode, appVersion, remixID) {
    // private
    var scene = new Scene(),
        model,
        hidden,
        nameID;

    this.scene = scene;

    model = {scene: xmlNode };
    if (+xmlNode.attributes.version > this.version) {
        throw 'Project uses newer version of Serializer';
    }

    /* Project Info */

    this.objects = {};
    scene.name = model.scene.attributes.name;
    if (!scene.name) {
        nameID = 1;
        while (
            Object.prototype.hasOwnProperty.call(
                localStorage,
                '-snap-project-Untitled ' + nameID
            )
        ) {
            nameID += 1;
        }
        scene.name = 'Untitled ' + nameID;
    }
    if(model.scene.attributes["customData"]){
        scene.customData = model.scene.attributes["customData"];
    }
    scene.unifiedPalette = model.scene.attributes.palette === 'single';
    scene.showCategories = model.scene.attributes.categories !== 'false';
    scene.showPaletteButtons = model.scene.attributes.buttons !== 'false';
    scene.disableClickToRun = model.scene.attributes.clickrun === 'false';
    scene.disableDraggingData = model.scene.attributes.dragdata === 'false';
    scene.penColorModel = model.scene.attributes.colormodel === 'hsl' ?
        'hsl' : 'hsv';
    model.notes = model.scene.childNamed('notes');
    if (model.notes) {
        scene.notes = model.notes.contents;
    }
    model.palette = model.scene.childNamed('palette');
    if (model.palette) {
        scene.customCategories = this.loadPalette(model.palette);
        SpriteMorph.prototype.customCategories = scene.customCategories;
    }
    model.globalVariables = model.scene.childNamed('variables');

    /* Stage */

    model.stage = model.scene.require('stage');
    scene.stage.remixID = remixID;

    if (Object.prototype.hasOwnProperty.call(
            model.stage.attributes,
            'id'
        )) {
        this.objects[model.stage.attributes.id] = scene.stage;
    }
    if (model.stage.attributes.customData){
        scene.stage.customData = model.stage.attributes.customData;
    }
    if (model.stage.attributes.name) {
        scene.stage.name = model.stage.attributes.name;
    }
    if (model.stage.attributes.color) {
        scene.stage.color = this.loadColor(model.stage.attributes.color);
        scene.stage.cachedColorDimensions = scene.stage.color[
            SpriteMorph.prototype.penColorModel
        ]();
    }
    if (model.stage.attributes.volume) {
        scene.stage.volume = +model.stage.attributes.volume;
    }
    if (model.stage.attributes.pan) {
        scene.stage.pan = +model.stage.attributes.pan;
    }
    if (model.stage.attributes.penlog) {
        scene.enablePenLogging =
            (model.stage.attributes.penlog === 'true');
    }

    model.pentrails = model.stage.childNamed('pentrails');
    if (model.pentrails) {
        scene.pentrails = new Image();
        scene.pentrails.onload = function () {
            if (scene.stage.trailsCanvas) { // work-around a bug in FF
                normalizeCanvas(scene.stage.trailsCanvas);
                var context = scene.stage.trailsCanvas.getContext('2d');
                context.drawImage(scene.pentrails, 0, 0);
                scene.stage.changed();
            }
        };
        scene.pentrails.src = model.pentrails.contents;
    }
    scene.stage.setTempo(model.stage.attributes.tempo);
    if (model.stage.attributes.width) {
        scene.stage.dimensions.x =
            Math.max(+model.stage.attributes.width, 240);
    }
    if (model.stage.attributes.height) {
        scene.stage.dimensions.y =
            Math.max(+model.stage.attributes.height, 180);
    }
    scene.stage.setExtent(scene.stage.dimensions);
    scene.useFlatLineEnds =
        model.stage.attributes.lines === 'flat';
    BooleanSlotMorph.prototype.isTernary =
        model.stage.attributes.ternary !== 'false';
    scene.enableHyperOps =
        model.stage.attributes.hyperops !== 'falses';
    scene.stage.isThreadSafe =
        model.stage.attributes.threadsafe === 'true';
    scene.enableCodeMapping =
        model.stage.attributes.codify === 'true';
    scene.enableInheritance =
        model.stage.attributes.inheritance !== 'false';
    scene.enableSublistIDs =
        model.stage.attributes.sublistIDs === 'true';

    model.hiddenPrimitives = model.scene.childNamed('hidden');
    if (model.hiddenPrimitives) {
        hidden = model.hiddenPrimitives.contents.split(' ').filter(word =>
            word.length > 0);
        if (hidden.length) {
            hidden.forEach(
                sel => {
                    var selector, migration;
                    if (sel) {
                        migration = SpriteMorph.prototype.blockMigrations[sel];
                        selector = migration ? migration.selector : sel;
                        scene.hiddenPrimitives[selector] = true;
                    }
                }
            );

            // hide new primitives that have been added to the palette
            // since the project has been last saved
            SpriteMorph.prototype.newPrimitivesSince(appVersion).forEach(
                sel => {
                    var selector, migration;
                    if (sel) {
                        migration = SpriteMorph.prototype.blockMigrations[sel];
                        selector = migration ? migration.selector : sel;
                        scene.hiddenPrimitives[selector] = true;
                    }
                }
            );
        }
    }

    model.codeHeaders = model.scene.childNamed('headers');
    if (model.codeHeaders) {
        model.codeHeaders.children.forEach(
            xml => scene.codeHeaders[xml.tag] = xml.contents
        );
    }

    model.codeMappings = model.scene.childNamed('code');
    if (model.codeMappings) {
        model.codeMappings.children.forEach(
            xml => scene.codeMappings[xml.tag] = xml.contents
        );
    }

    model.globalBlocks = model.scene.childNamed('blocks');
    if (model.globalBlocks) {
        this.loadCustomBlocks(scene.stage, model.globalBlocks, true);
        this.populateCustomBlocks(
            scene.stage,
            model.globalBlocks,
            true
        );
    }
    this.loadObject(scene.stage, model.stage);

    /* Sprites */

    model.sprites = model.stage.require('sprites');
    if (model.sprites.attributes.select) {
        scene.spriteIdx = +model.sprites.attributes.select;
    }
    scene.spritesDict[scene.stage.name] = scene.stage;
    model.sprites.childrenNamed('sprite').forEach(
        model => this.loadValue(model)
    );

    // restore inheritance and nesting associations
    this.scene.stage.children.forEach(sprite => {
        var matchingModelData = model.sprites.childrenNamed('sprite').filter(
            model => model.attributes["name"] == sprite.name
        );
        if(matchingModelData.length > 0){
            var matchingSpriteData = matchingModelData[0];
            if(matchingSpriteData.attributes["customData"]){
                sprite.customData = matchingSpriteData.attributes["customData"];
            }
        }
        var exemplar, anchor;
        if (sprite.inheritanceInfo) { // only sprites can inherit
            exemplar = this.scene.spritesDict[
                sprite.inheritanceInfo.exemplar
            ];
            if (exemplar) {
                sprite.setExemplar(exemplar);
            }
            sprite.inheritedAttributes = sprite.inheritanceInfo.delegated || [];
            sprite.updatePropagationCache();
        }
        if (sprite.nestingInfo) { // only sprites may have nesting info
            anchor = this.scene.spritesDict[sprite.nestingInfo.anchor];
            if (anchor) {
                anchor.attachPart(sprite);
            }
            sprite.rotatesWithAnchor = (sprite.nestingInfo.synch === 'true');
        }
    });
    this.scene.stage.children.forEach(sprite => {
        var costume;
        if (sprite.nestingInfo) { // only sprites may have nesting info
            sprite.nestingScale = +(sprite.nestingInfo.scale || sprite.scale);
            delete sprite.nestingInfo;
        }
        ['scripts', 'costumes', 'sounds'].forEach(att => {
            if (sprite.inheritsAttribute(att)) {
                sprite.refreshInheritedAttribute(att);
            }
        });
        if (sprite.inheritsAttribute('costumes')) {
            if (sprite.inheritsAttribute('costume #')) {
                costume = sprite.exemplar.costume;
            } else {
                costume = sprite.costumes.asArray()[
                    sprite.inheritanceInfo.costumeNumber - 1
                ];
            }
            if (costume) {
                if (costume.loaded) {
                    sprite.wearCostume(costume, true);
                } else {
                    costume.loaded = function () {
                        this.loaded = true;
                        sprite.wearCostume(costume, true);
                    };
                }
            }
        }
        delete sprite.inheritanceInfo;
    });

    /* Global Variables */

    if (model.globalVariables) {
        this.loadVariables(
            scene.globalVariables,
            model.globalVariables
        );
    }

    this.objects = {};

    /* Watchers */

    model.sprites.childrenNamed('watcher').forEach(model => {
        var watcher, color, target, hidden, extX, extY;

        color = this.loadColor(model.attributes.color);
        target = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'scope'
        ) ? scene.spritesDict[model.attributes.scope] : null;

        // determine whether the watcher is hidden, slightly
        // complicated to retain backward compatibility
        // with former tag format: hidden="hidden"
        // now it's: hidden="true"
        hidden = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'hidden'
        ) && (model.attributes.hidden !== 'false');

        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'var'
            )) {
            watcher = new WatcherMorph(
                model.attributes['var'],
                color,
                isNil(target) ? scene.globalVariables
                    : target.variables,
                model.attributes['var'],
                hidden
            );
        } else {
            watcher = new WatcherMorph(
                localize(this.watcherLabels[model.attributes.s]),
                color,
                target,
                model.attributes.s,
                hidden
            );
        }
        watcher.setStyle(model.attributes.style || 'normal');
        if (watcher.style === 'slider') {
            watcher.setSliderMin(model.attributes.min || '1', true);
            watcher.setSliderMax(model.attributes.max || '100', true);
        }
        watcher.setPosition(
            scene.stage.topLeft().add(new Point(
                +model.attributes.x || 0,
                +model.attributes.y || 0
            )).multiplyBy(scene.stage.scale)
        );
        scene.stage.add(watcher);
        watcher.onNextStep = function () {this.currentValue = null; };

        // set watcher's contentsMorph's extent if it is showing a list and
        // its monitor dimensions are given
        if (watcher.currentValue instanceof List &&
                watcher.cellMorph.contentsMorph) {
            extX = model.attributes.extX;
            if (extX) {
                watcher.cellMorph.contentsMorph.setWidth(+extX);
            }
            extY = model.attributes.extY;
            if (extY) {
                watcher.cellMorph.contentsMorph.setHeight(+extY);
            }
            // adjust my contentsMorph's handle position
            watcher.cellMorph.contentsMorph.handle.fixLayout();
        }
    });

    // clear sprites' inherited methods caches, if any
    this.scene.stage.children.forEach(
        sprite => sprite.inheritedMethodsCache = []
    );

    this.objects = {};
    return scene.initialize();
};

StageMorph.prototype.toXML = function (serializer) {
    var costumeIdx = this.getCostumeIdx();

    this.removeAllClones();
    if(this.customData){
        return serializer.format(
            '<stage name="@" width="@" height="@" ' +
            'costume="@" color="@,@,@,@" tempo="@" threadsafe="@" ' +
            'penlog="@" ' +
            '%' +
            'volume="@" ' +
            'pan="@" ' +
            'lines="@" ' +
            'ternary="@" ' +
            'hyperops="@" ' +
            'codify="@" ' +
            'inheritance="@" ' +
            'sublistIDs="@" customData="@" ~>' +
            '<pentrails>$</pentrails>' +
            '%' + // current costume, if it's not in the wardrobe
            '<costumes>%</costumes>' +
            '<sounds>%</sounds>' +
            '<variables>%</variables>' +
            '<blocks>%</blocks>' +
            '<scripts>%</scripts>' +
            '<sprites select="@">%</sprites>' +
            '</stage>',
        this.name,
        this.dimensions.x,
        this.dimensions.y,
        costumeIdx,
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a,
        this.getTempo(),
        this.isThreadSafe,
        this.enablePenLogging,
        this.instrument ?
                ' instrument="' + parseInt(this.instrument) + '" ' : '',
        this.volume,
        this.pan,
        SpriteMorph.prototype.useFlatLineEnds ? 'flat' : 'round',
        BooleanSlotMorph.prototype.isTernary,
        Process.prototype.enableHyperOps === true,
        this.enableCodeMapping,
        this.enableInheritance,
        this.enableSublistIDs,
        this.customData,
        normalizeCanvas(this.trailsCanvas, true).toDataURL('image/png'),

        // current costume, if it's not in the wardrobe
        !costumeIdx && this.costume ?
            '<wear>' + serializer.store(this.costume) + '</wear>'
                : '',

        serializer.store(this.costumes, this.name + '_cst'),
        serializer.store(this.sounds, this.name + '_snd'),
        serializer.store(this.variables),
        serializer.store(this.customBlocks),
        serializer.store(this.scripts),
        serializer.root.sprites.asArray().indexOf(
            serializer.root.currentSprite) + 1,
        serializer.store(this.children)
    );
    }
    return serializer.format(
            '<stage name="@" width="@" height="@" ' +
            'costume="@" color="@,@,@,@" tempo="@" threadsafe="@" ' +
            'penlog="@" ' +
            '%' +
            'volume="@" ' +
            'pan="@" ' +
            'lines="@" ' +
            'ternary="@" ' +
            'hyperops="@" ' +
            'codify="@" ' +
            'inheritance="@" ' +
            'sublistIDs="@" ~>' +
            '<pentrails>$</pentrails>' +
            '%' + // current costume, if it's not in the wardrobe
            '<costumes>%</costumes>' +
            '<sounds>%</sounds>' +
            '<variables>%</variables>' +
            '<blocks>%</blocks>' +
            '<scripts>%</scripts>' +
            '<sprites select="@">%</sprites>' +
            '</stage>',
        this.name,
        this.dimensions.x,
        this.dimensions.y,
        costumeIdx,
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a,
        this.getTempo(),
        this.isThreadSafe,
        this.enablePenLogging,
        this.instrument ?
                ' instrument="' + parseInt(this.instrument) + '" ' : '',
        this.volume,
        this.pan,
        SpriteMorph.prototype.useFlatLineEnds ? 'flat' : 'round',
        BooleanSlotMorph.prototype.isTernary,
        Process.prototype.enableHyperOps === true,
        this.enableCodeMapping,
        this.enableInheritance,
        this.enableSublistIDs,
        normalizeCanvas(this.trailsCanvas, true).toDataURL('image/png'),

        // current costume, if it's not in the wardrobe
        !costumeIdx && this.costume ?
            '<wear>' + serializer.store(this.costume) + '</wear>'
                : '',

        serializer.store(this.costumes, this.name + '_cst'),
        serializer.store(this.sounds, this.name + '_snd'),
        serializer.store(this.variables),
        serializer.store(this.customBlocks),
        serializer.store(this.scripts),
        serializer.root.sprites.asArray().indexOf(
            serializer.root.currentSprite) + 1,
        serializer.store(this.children)
    );
};

StageMorph.prototype.toSpriteXML = function (serializer) {
    // special case: export the stage as a sprite, so it can be
    // imported into another project or scene
    var costumeIdx = this.getCostumeIdx();

    if(this.customData){
        return serializer.format(
            '<sprite name="@" idx="1" x="0" y="0"' +
                ' heading="90"' +
                ' scale="1"' +
                ' volume="@"' +
                ' pan="@"' +
                ' rotation="0"' +
                '%' +
                ' draggable="true"' +
                ' costume="@" color="80,80,80,1" pen="tip" customData="@" ~>' +
                '%' + // current costume
                '<costumes>%</costumes>' +
                '<sounds>%</sounds>' +
                '<blocks>%</blocks>' +
                '<variables>%</variables>' +
                '<scripts>%</scripts>' +
                '</sprite>',
            this.name,
            this.volume,
            this.pan,
            this.instrument ?
                    ' instrument="' + parseInt(this.instrument) + '" ' : '',
            costumeIdx,
            this.customData,
    
            // current costume, if it's not in the wardrobe
            !costumeIdx && this.costume ?
                '<wear>' + serializer.store(this.costume) + '</wear>'
                    : '',
    
            serializer.store(this.costumes, this.name + '_cst'),
            serializer.store(this.sounds, this.name + '_snd'),
            !this.customBlocks ? '' : serializer.store(this.customBlocks),
            serializer.store(this.variables),
            serializer.store(this.scripts)
        );
    }
    return serializer.format(
        '<sprite name="@" idx="1" x="0" y="0"' +
            ' heading="90"' +
            ' scale="1"' +
            ' volume="@"' +
            ' pan="@"' +
            ' rotation="0"' +
            '%' +
            ' draggable="true"' +
            ' costume="@" color="80,80,80,1" pen="tip" ~>' +
            '%' + // current costume
            '<costumes>%</costumes>' +
            '<sounds>%</sounds>' +
            '<blocks>%</blocks>' +
            '<variables>%</variables>' +
            '<scripts>%</scripts>' +
            '</sprite>',
        this.name,
        this.volume,
        this.pan,
        this.instrument ?
                ' instrument="' + parseInt(this.instrument) + '" ' : '',
        costumeIdx,

        // current costume, if it's not in the wardrobe
        !costumeIdx && this.costume ?
            '<wear>' + serializer.store(this.costume) + '</wear>'
                : '',

        serializer.store(this.costumes, this.name + '_cst'),
        serializer.store(this.sounds, this.name + '_snd'),
        !this.customBlocks ? '' : serializer.store(this.customBlocks),
        serializer.store(this.variables),
        serializer.store(this.scripts)
    );
};

SpriteMorph.prototype.toXML = function (serializer) {
    var idx = serializer.scene.sprites.asArray().indexOf(this) + 1,
        costumeIdx = this.getCostumeIdx(),
        noCostumes = this.inheritsAttribute('costumes'),
        noSounds = this.inheritsAttribute('sounds'),
        noScripts = this.inheritsAttribute('scripts');

        if(this.customData){
            return serializer.format(
                '<sprite name="@" idx="@" x="@" y="@"' +
                    ' heading="@"' +
                    ' scale="@"' +
                    ' volume="@"' +
                    ' pan="@"' +
                    ' rotation="@"' +
                    '%' +
                    ' draggable="@"' +
                    '%' +
                    ' costume="@" color="@,@,@,@" pen="@" customData="@" ~>' +
                    '%' + // solution info
                    '%' + // inheritance info
                    '%' + // nesting info
                    '%' + // current costume
                    (noCostumes ? '%' : '<costumes>%</costumes>') +
                    (noSounds ? '%' : '<sounds>%</sounds>') +
                    '<blocks>%</blocks>' +
                    '<variables>%</variables>' +
                    (this.exemplar ? '<dispatches>%</dispatches>' : '%') +
                    (noScripts ? '%' : '<scripts>%</scripts>') +
                    '</sprite>',
                this.name,
                idx,
                this.xPosition(),
                this.yPosition(),
                this.heading,
                this.scale,
                this.volume,
                this.pan,
                this.rotationStyle,
                this.instrument ?
                        ' instrument="' + parseInt(this.instrument) + '" ' : '',
                this.isDraggable,
                this.isVisible ? '' : ' hidden="true"',
                costumeIdx,
                this.color.r,
                this.color.g,
                this.color.b,
                this.color.a,
                this.penPoint,
                this.customData,
        
                // solution info
                this.solution
                    ? '<solution>' + serializer.store(this.solution) + '</solution>'
                    : '',
        
                // inheritance info
                this.exemplar
                    ? '<inherit exemplar="' +
                            this.exemplar.name +
                            '">' +
                            (this.inheritedAttributes.length ?
                                serializer.store(new List(this.inheritedAttributes))
                                : '') +
                            '</inherit>'
                    : '',
        
                // nesting info
                this.anchor
                    ? '<nest anchor="' +
                            this.anchor.name +
                            '" synch="'
                            + this.rotatesWithAnchor
                            + (this.scale === this.nestingScale ? '' :
                                    '"'
                                    + ' scale="'
                                    + this.nestingScale)
        
                            + '"/>'
                    : '',
        
                // current costume, if it's not in the wardrobe
                !costumeIdx && this.costume ?
                    '<wear>' + serializer.store(this.costume) + '</wear>'
                        : '',
        
                noCostumes ? '' : serializer.store(this.costumes, this.name + '_cst'),
                noSounds ? '' : serializer.store(this.sounds, this.name + '_snd'),
                !this.customBlocks ? '' : serializer.store(this.customBlocks),
                serializer.store(this.variables),
                this.exemplar ? serializer.store(this.inheritedMethods()) : '',
                noScripts ? '' : serializer.store(this.scripts)
            );
        }
        return serializer.format(
            '<sprite name="@" idx="@" x="@" y="@"' +
                ' heading="@"' +
                ' scale="@"' +
                ' volume="@"' +
                ' pan="@"' +
                ' rotation="@"' +
                '%' +
                ' draggable="@"' +
                '%' +
                ' costume="@" color="@,@,@,@" pen="@" ~>' +
                '%' + // solution info
                '%' + // inheritance info
                '%' + // nesting info
                '%' + // current costume
                (noCostumes ? '%' : '<costumes>%</costumes>') +
                (noSounds ? '%' : '<sounds>%</sounds>') +
                '<blocks>%</blocks>' +
                '<variables>%</variables>' +
                (this.exemplar ? '<dispatches>%</dispatches>' : '%') +
                (noScripts ? '%' : '<scripts>%</scripts>') +
                '</sprite>',
            this.name,
            idx,
            this.xPosition(),
            this.yPosition(),
            this.heading,
            this.scale,
            this.volume,
            this.pan,
            this.rotationStyle,
            this.instrument ?
                    ' instrument="' + parseInt(this.instrument) + '" ' : '',
            this.isDraggable,
            this.isVisible ? '' : ' hidden="true"',
            costumeIdx,
            this.color.r,
            this.color.g,
            this.color.b,
            this.color.a,
            this.penPoint,
    
            // solution info
            this.solution
                ? '<solution>' + serializer.store(this.solution) + '</solution>'
                : '',
    
            // inheritance info
            this.exemplar
                ? '<inherit exemplar="' +
                        this.exemplar.name +
                        '">' +
                        (this.inheritedAttributes.length ?
                            serializer.store(new List(this.inheritedAttributes))
                            : '') +
                        '</inherit>'
                : '',
    
            // nesting info
            this.anchor
                ? '<nest anchor="' +
                        this.anchor.name +
                        '" synch="'
                        + this.rotatesWithAnchor
                        + (this.scale === this.nestingScale ? '' :
                                '"'
                                + ' scale="'
                                + this.nestingScale)
    
                        + '"/>'
                : '',
    
            // current costume, if it's not in the wardrobe
            !costumeIdx && this.costume ?
                '<wear>' + serializer.store(this.costume) + '</wear>'
                    : '',
    
            noCostumes ? '' : serializer.store(this.costumes, this.name + '_cst'),
            noSounds ? '' : serializer.store(this.sounds, this.name + '_snd'),
            !this.customBlocks ? '' : serializer.store(this.customBlocks),
            serializer.store(this.variables),
            this.exemplar ? serializer.store(this.inheritedMethods()) : '',
            noScripts ? '' : serializer.store(this.scripts)
        );
};

Costume.prototype.toXML = function (serializer) {
    if(this.customData){
        return serializer.format(
            '<costume name="@" center-x="@" center-y="@" customData="@" image="@"% ~/>',
            this.name,
            this.rotationCenter.x,
            this.rotationCenter.y,
            this.customData,
            this instanceof SVG_Costume ? this.contents.src
                    : normalizeCanvas(this.contents).toDataURL('image/png'),
            this.embeddedData ? serializer.format(' embed="@"', this.embeddedData)
                : ''
        );
    }
    return serializer.format(
        '<costume name="@" center-x="@" center-y="@" image="@"% ~/>',
        this.name,
        this.rotationCenter.x,
        this.rotationCenter.y,
        this instanceof SVG_Costume ? this.contents.src
                : normalizeCanvas(this.contents).toDataURL('image/png'),
        this.embeddedData ? serializer.format(' embed="@"', this.embeddedData)
            : ''
    );
};

Sound.prototype.toXML = function (serializer) {
    if(this.customData){
        return serializer.format(
            '<sound name="@" customData="@" sound="@" ~/>',
            this.name,
            this.customData,
            this.toDataURL()
        );
    }
    return serializer.format(
        '<sound name="@" sound="@" ~/>',
        this.name,
        this.toDataURL()
    );
};

SnapSerializer.prototype.loadValue = function (model, object, silently) {
    // private
    var v, i, lst, items, el, center, image, name, audio, option, bool, origin,
    	wish, def,
        myself = this;

    function record() {
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'id'
            )) {
            myself.objects[model.attributes.id] = v;
        }
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'mediaID'
            )) {
            myself.mediaDict[model.attributes.mediaID] = v;
        }
    }

    switch (model.tag) {
    case 'ref':
        if (Object.prototype.hasOwnProperty.call(model.attributes, 'id')) {
            return this.objects[model.attributes.id];
        }
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'mediaID'
            )) {
            return this.mediaDict[model.attributes.mediaID];
        }
        throw new Error('expecting a reference id');
    case 'l':
        option = model.childNamed('option');
        if (option) {
            return [option.contents];
        }
        bool = model.childNamed('bool');
        if (bool) {
            return this.loadValue(bool);
        }
        wish = model.childNamed('wish');
        if (wish) {
            return this.loadValue(wish);
        }
        return model.contents;
    case 'bool':
        return model.contents === 'true';
    case 'list':
        if (model.attributes.hasOwnProperty('linked')) {
            if (model.attributes.struct === 'atomic') {
                v = Process.prototype.parseCSV(model.contents);
                v.becomeLinked();
                record();
                return v;
            }
            v = new List();
            v.isLinked = true;
            record();
            lst = v;
            items = model.childrenNamed('item');
            items.forEach((item, i) => {
                var value = item.children[0];
                if (!value) {
                    v.first = 0;
                } else {
                    v.first = this.loadValue(value, object);
                }
                var tail = model.childNamed('list') ||
                    model.childNamed('ref');
                if (tail) {
                    v.rest = this.loadValue(tail, object);
                } else {
                    if (i < (items.length - 1)) {
                        v.rest = new List();
                        v = v.rest;
                        v.isLinked = true;
                    }
                }
            });
            return lst;
        }
        if (model.attributes.struct === 'atomic') {
            v = Process.prototype.parseCSV(model.contents);
            record();
            return v;
        }
        v = new List();
        record();
        v.contents = model.childrenNamed('item').map(item => {
            var value = item.children[0];
            if (!value) {
                return 0;
            }
            return this.loadValue(value, object);
        });
        return v;
    case 'sprite':
        v  = new SpriteMorph(this.scene.globalVariables);
        if (model.attributes.id) {
            this.objects[model.attributes.id] = v;
        }
        if (model.attributes.name) {
            v.name = model.attributes.name;
            this.scene.spritesDict[model.attributes.name] = v;
        }
        if (model.attributes.idx) {
            v.idx = +model.attributes.idx;
        }
        if (model.attributes.color) {
            v.color = this.loadColor(model.attributes.color);
            v.cachedColorDimensions = v.color[v.penColorModel]();
        }
        if (model.attributes.pen) {
            v.penPoint = model.attributes.pen;
        }
        if (model.attributes.volume) {
            v.volume = +model.attributes.volume;
        }
        if (model.attributes.pan) {
            v.pan = +model.attributes.pan;
        }
        if (!silently) {
            this.scene.stage.add(v);
        }
        v.scale = parseFloat(model.attributes.scale || '1');
        v.rotationStyle = parseFloat(
            model.attributes.rotation || '1'
        );
        v.isDraggable = model.attributes.draggable !== 'false';
        v.isVisible = model.attributes.hidden !== 'true';
        v.heading = parseFloat(model.attributes.heading) || 0;
        if (!silently) {
            v.gotoXY(+model.attributes.x || 0, +model.attributes.y || 0);
        }
        this.loadObject(v, model);
        v.fixLayout();

        return v;
    case 'context':
        v = new Context(null);
        record();
        v.comment = model.childNamed('remark')?.contents;
        el = model.childNamed('origin');
        if (el) {
            el = el.childNamed('ref') || el.childNamed('sprite');
            if (el) {
                v.origin = this.loadValue(el);
            }
        }
        el = model.childNamed('receiver');
        if (el) {
            el = el.childNamed('ref') || el.childNamed('sprite');
            if (el) {
                v.receiver = this.loadValue(el);
            }
        }
        origin = v.origin || v.receiver || object; // for local blocks look up
        el = model.childNamed('script');
        if (el) {
            v.expression = this.loadScript(el, origin);
        } else {
            el = model.childNamed('block') ||
                model.childNamed('custom-block');
            if (el) {
                v.expression = this.loadBlock(el, null, origin);
            } else {
                el = model.childNamed('l');
                if (el) {
                    bool = el.childNamed('bool');
                    if (bool) {
                        v.expression = new BooleanSlotMorph(
                            this.loadValue(bool)
                        );
                    } else {
                        v.expression = new InputSlotMorph(el.contents);
                    }
                }
            }
        }
        if (v.expression instanceof BlockMorph) {
            // bind empty slots to implicit formal parameters
            i = 0;
            v.expression.allEmptySlots().forEach(slot => {
                i += 1;
                if (slot instanceof MultiArgMorph) {
                    slot.bindingID = ['arguments'];
                } else {
                    slot.bindingID = i;
                }
            });
            // and remember the number of detected empty slots
            v.emptySlots = i;
        }
        el = model.childNamed('inputs');
        if (el) {
            el.children.forEach(item => {
                if (item.tag === 'input') {
                    v.inputs.push(item.contents);
                }
            });
        }
        el = model.childNamed('variables');
        if (el) {
            this.loadVariables(v.variables, el, origin);
        }
        el = model.childNamed('context');
        if (el) {
            v.outerContext = this.loadValue(el, origin);
        }
        if (v.outerContext && v.receiver &&
                !v.outerContext.variables.parentFrame) {
            v.outerContext.variables.parentFrame = v.receiver.variables;
        }
        return v;
    case 'costume':
        center = new Point();
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'center-x'
            )) {
            center.x = parseFloat(model.attributes['center-x']);
        }
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'center-y'
            )) {
            center.y = parseFloat(model.attributes['center-y']);
        }
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'name'
            )) {
            name = model.attributes.name;
        }
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'image'
            )) {
            image = new Image();
            if (model.attributes.image.indexOf('data:image/svg+xml') === 0
                    && !MorphicPreferences.rasterizeSVGs) {
                v = new SVG_Costume(null, name, center);
                image.onload = function () {
                    v.contents = image;
                    v.version = +new Date();
                    if (typeof v.loaded === 'function') {
                        v.loaded();
                    } else {
                        v.loaded = true;
                    }
                };
            } else {
                v = new Costume(null, name, center);
                image.onload = function () {
                    var canvas = newCanvas(
                            new Point(image.width, image.height),
                            true // nonRetina
                        ),
                        context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0);
                    v.contents = canvas;
                    v.version = +new Date();
                    if (Object.prototype.hasOwnProperty.call(
                        model.attributes,
                        'embed'
                    )) {
                        v.embeddedData = model.attributes.embed;
                    }
                    if (typeof v.loaded === 'function') {
                        v.loaded();
                    } else {
                        v.loaded = true;
                    }
                };
            }
            image.src = model.attributes.image;
            if(model.attributes["customData"]){
                v.customData = model.attributes["customData"];
            }
        }
        record();
        return v;
    case 'sound':
        audio = new Audio();
        v = new Sound(audio, model.attributes.name);
        audio.oncanplaythrough = () => v.loaded = true;
        audio.src = model.attributes.sound;
        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'mediaID'
            )) {
            this.mediaDict[model.attributes.mediaID] = v;
        }
        if(model.attributes["customData"]){
            v.customData = model.attributes["customData"];
        }
        record();
        return v;
    case 'wish':
    	def = new CustomBlockDefinition(model.attributes.s);
     	def.type = model.attributes.type;
      	def.category = model.attributes.category;
       	def.storedSemanticSpec = model.attributes.s;
        def.updateTranslations(model.contents);
        return def.blockInstance(true); // include translations
    }
    return undefined;
};

SnapSerializer.prototype.loadVariables = function (varFrame, element, object) {
    // private
    element.children.forEach(child => {
        var v, value;
        if (child.tag !== 'variable') {
            return;
        }
        value = child.children[0];
        v = new Variable();
        if(child.attributes["customData"]){
            v.customData = child.attributes["customData"];
        }
        v.isTransient = (child.attributes.transient === 'true');
        v.isHidden = (child.attributes.hidden === 'true');
        v.value = (v.isTransient || !value ) ? 0
                : this.loadValue(value, object);
        varFrame.vars[child.attributes.name] = v;
    });
};

VariableFrame.prototype.toXML = function (serializer) {
    return Object.keys(this.vars).reduce((vars, v) => {
        var val = this.vars[v].value,
            transient = this.vars[v].isTransient,
            hidden = this.vars[v].isHidden,
            dta
            customData = this.vars[v]["customData"];

        if (transient || val === undefined || val === null) {
            if(customData){
                dta = serializer.format(
                    '<variable name="@"' +
                        (transient ? ' transient="true"' : '') +
                        (hidden ? ' hidden="true"' : '') +
                        (customData ? ' customData="@"' : '') +
                        '/>',
                    v,
                    customData
                );
            } else {
                dta = serializer.format(
                    '<variable name="@"' +
                        (transient ? ' transient="true"' : '') +
                        (hidden ? ' hidden="true"' : '') +
                        '/>',
                    v
                );
            }
        } else {
            if(customData){
                dta = serializer.format(
                    '<variable name="@"' +
                        (transient ? ' transient="true"' : '') +
                        (hidden ? ' hidden="true"' : '') +
                        ' customData="@"'+
                        '>%</variable>',
                    v,
                    customData,
                    typeof val === 'object' ?
                            (isSnapObject(val) ? ''
                                    : serializer.store(val))
                                    : typeof val === 'boolean' ?
                                            serializer.format(
                                                '<bool>$</bool>', val
                                            )
                                            : serializer.format('<l>$</l>', val)
                );
            } else {
                dta = serializer.format(
                    '<variable name="@"' +
                        (transient ? ' transient="true"' : '') +
                        (hidden ? ' hidden="true"' : '') +
                        '>%</variable>',
                    v,
                    typeof val === 'object' ?
                            (isSnapObject(val) ? ''
                                    : serializer.store(val))
                                    : typeof val === 'boolean' ?
                                            serializer.format(
                                                '<bool>$</bool>', val
                                            )
                                            : serializer.format('<l>$</l>', val)
                );
            }
        }
        return vars + dta;
    }, '');
};

Project.prototype.toXML = function (serializer) {
    var thumbdata;

    // thumb data catch cross-origin tainting exception when using SVG costumes
    try {
        thumbdata = this.thumbnail.toDataURL('image/png');
    } catch (error) {
        thumbdata = null;
    }

    if(window.projectCustomData){
        return serializer.format(
            '<project name="@" app="@" version="@" customData="@">' +
                '<notes>$</notes>' +
                '<thumbnail>$</thumbnail>' +
                '<scenes select="@">%</scenes>' +
                '</project>',
            this.name || localize('Untitled'),
            serializer.app,
            serializer.version,
            window.projectCustomData,
            this.notes || '',
            thumbdata,
            this.scenes.asArray().indexOf(
                this.currentScene) + 1,
            serializer.store(this.scenes.itemsArray())
        );
    }

    return serializer.format(
        '<project name="@" app="@" version="@">' +
            '<notes>$</notes>' +
            '<thumbnail>$</thumbnail>' +
            '<scenes select="@">%</scenes>' +
            '</project>',
        this.name || localize('Untitled'),
        serializer.app,
        serializer.version,
        this.notes || '',
        thumbdata,
        this.scenes.asArray().indexOf(
            this.currentScene) + 1,
        serializer.store(this.scenes.itemsArray())
    );
};

SnapSerializer.prototype.loadProjectModel = function (xmlNode, ide, remixID) {
    // public - answer a new Project represented by the given XML top node
    // show a warning if the origin apps differ

    var appInfo = xmlNode.attributes.app,
        app = appInfo ? appInfo.split(' ')[0] : null,
        appVersion = appInfo ? parseFloat(appInfo.split(' ')[1]) || 0 : 0,
        scenesModel = xmlNode.childNamed('scenes'),
        project = new Project();

    if (ide && app && app !== this.app.split(' ')[0]) {
        ide.inform(
            app + ' Project',
            'This project has been created by a different app:\n\n' +
                app +
                '\n\nand may be incompatible or fail to load here.'
        ).nag = true;
    }
    if (scenesModel) {
        if (scenesModel.attributes.select) {
            project.sceneIdx = +scenesModel.attributes.select;
        }
        scenesModel.childrenNamed('scene').forEach(model => {
            ide.scene.captureGlobalSettings();
            project.scenes.add(this.loadScene(model, appVersion));
            ide.scene.applyGlobalSettings();
        });
    } else {
        project.scenes.add(this.loadScene(xmlNode, appVersion, remixID));
    }
    if(xmlNode.attributes["customData"]){
        //since project is not maintained as object from deserialize to serialize, 
        //and project only is named once, add customData to window...
        window.projectCustomData = xmlNode.attributes["customData"];
    }
    return project.initialize();
};

loadFile();
world.children[0].setBlocksScale(1);

async function loadFile () {
  var res = await fetch("{{url}}");
  var xml = await res.text();

  // fix xml encoding for umlaute
  let charMap = {
    "&#252;": "ü",
    "&#246;": "ö",
    "&#228;": "ä",
    "&#220;": "Ü",
    "&#214;": "Ö",
    "&#196;": "Ä",
    "&#223;": "ß",
    "&#8364;": "€"
  };
  for(let entity in charMap) {
    let char = charMap[entity];
    xml= xml.replace(new RegExp(entity, 'g'), char);
  }
  var ide = window.world.root().children[0];
  ide.loadProjectXML(xml)
}