import { __core_private__ as r, NO_ERRORS_SCHEMA, ViewEncapsulation } from '@angular/core';
import * as compiler from '@angular/compiler';

import { Config, DirectiveDeclaration } from '../config';
import { SemVerDSL } from '../../util/ngVersion';

let refId = 0;

const dummyMetadataFactory = (declaration: DirectiveDeclaration) => {
  if (refId > 1e10) {
    refId = 0;
  }
  return {
    inputs: declaration.inputs || [],
    outputs: declaration.outputs || [],
    hostListeners: declaration.hostListeners || {},
    hostProperties: declaration.hostProperties || {},
    hostAttributes: declaration.hostAttributes || {},
    isSummary: true,
    type: {
      diDeps: [],
      lifecycleHooks: [],
      isHost: false,
      reference: ++refId + '-ref'
    },
    isComponent: false,
    selector: declaration.selector,
    exportAs: declaration.exportAs,
    providers: [],
    viewProviders: [],
    queries: [],
    entryComponents: [],
    changeDetection: 0,
    template: {
      isSummary: true,
      animations: [],
      ngContentSelectors: [],
      encapsulation: 0
    }
  };
};

let defaultDirectives = [];

export const parseTemplate = (template: string, directives: DirectiveDeclaration[] = []) => {
  defaultDirectives = directives.map(d => dummyMetadataFactory(d));

  const TemplateParser = <any>compiler.TemplateParser;
  const expressionParser = new compiler.Parser(new compiler.Lexer());
  const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
  const ngConsole = new r.Console();
  const htmlParser =
      new compiler.I18NHtmlParser(new compiler.HtmlParser());

  let tmplParser: any;

  SemVerDSL
    .gte('4.0.0-beta.8', () => {
      const config = new compiler.CompilerConfig({});
      tmplParser =
        new TemplateParser(config, expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
    })
    .else(() => {
      tmplParser =
        new TemplateParser(expressionParser, elementSchemaRegistry, htmlParser, ngConsole, []);
    });

  const interpolation = Config.interpolation;

  // Make sure it works with 2.2.x & 2.3.x
  const summaryKind = ((compiler as any).CompileSummaryKind || {}).Template;
  const templateMetadata: compiler.CompileTemplateMetadata = {
    encapsulation: 0,
    template: template,
    templateUrl: '',
    styles: [],
    styleUrls: [],
    ngContentSelectors: [],
    animations: [],
    externalStylesheets: [],
    interpolation,
    toSummary() {
      return {
        isSummary: true,
        animations: this.animations.map(anim => anim.name),
        ngContentSelectors: this.ngContentSelectors,
        encapsulation: this.encapsulation,
        summaryKind: summaryKind
      } as any;
    }
  };

  // Make sure it works with 2.2.x & 2.3.x
  const type = {
    diDeps: [],
    lifecycleHooks: [],
    reference: null,

    // Used by Angular 2.2.x
    isHost: false,
    name: '',
    prefix: '',
    moduleUrl: '',
    value: '',
    identifier: null
  };
  const result = tmplParser.tryParse(
      compiler.CompileDirectiveMetadata.create({ type, template: templateMetadata }),
      template, defaultDirectives, [], [NO_ERRORS_SCHEMA], '').templateAst;
  return result;
};
