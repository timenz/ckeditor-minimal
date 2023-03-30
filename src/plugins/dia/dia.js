import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import diaIcon from './dia.svg'

const VISUAL_SELECTION_MARKER_NAME = 'link-ui';

class Dia extends Plugin {
	init () {
		const editor = this.editor

		const config = editor.config.get('dia')

		const activateFn = config.activate || null
		
		if (activateFn === null) {
			console.warn('dia config need field `activate`')
		}

		editor.ui.componentFactory.add('dia', () => {
			const button = new ButtonView()
			button.set({
				label: 'DIA',
				withText: false,
				icon: diaIcon,
				class: 'dia-icon',
				tooltip: 'Get AI Insight'
			})
			button.on('execute', () => {
				const fn = (text) => {
					if (text !== null) {
						editor.model.change( writer => {
							const viewFrag = editor.data.processor.toView(text)
							const modelFrag = editor.data.toModel(viewFrag)
							editor.model.insertContent(modelFrag)
						})
					}

          this.hideFakeVisualSelection()
					
				}
        const selection = editor.model.document.selection
        const range = selection.getFirstRange()
        let content = ''
        for(const item of range.getItems()) {
          content += item.data
        }

				editor.config._config.dia.activate(content, fn)
        this.showFakeVisualSelection()
				// editor.model.
			})
      editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
        model: VISUAL_SELECTION_MARKER_NAME,
        view: {
          classes: [ 'ck-fake-link-selection' ]
        }
      } );
  
      // Renders a fake visual selection marker on a collapsed selection.
      editor.conversion.for( 'editingDowncast' ).markerToElement( {
        model: VISUAL_SELECTION_MARKER_NAME,
        view: {
          name: 'span',
          classes: [ 'ck-link-dia-selection', 'ck-fake-link-selection_collapsed' ]
        }
      } );
			return button
		})

	}

  showFakeVisualSelection() {
    const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange();

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
				if ( range.start.isAtEnd ) {
					const startPosition = range.start.getLastMatchingPosition(
						( { item } ) => !model.schema.isContent( item ),
						{ boundaries: range }
					);

					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range: writer.createRange( startPosition, range.end )
					} );
				} else {
					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range
					} );
				}
			}
		} );
	}

	hideFakeVisualSelection() {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}
}

export default Dia