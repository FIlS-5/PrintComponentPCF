import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class PrintComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _notifyOutputChanged: () => void;
	private _container: HTMLDivElement;

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this._notifyOutputChanged = notifyOutputChanged;
		this._container = container;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		var params = context.parameters;

		if(!params.download?.raw) return;
		
		var newWindow = window.open('', params.printTitle.raw?.toString(), 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		// newWindow?.document.write(`${params.htmlContent.raw}`);
		let bodyContent = newWindow?.document.querySelector('body');
		
		if(bodyContent?.innerText==""){
			newWindow?.document.querySelector('body')?.insertAdjacentHTML("beforeend",`${params.htmlContent.raw}`);
			this.waitForImages(newWindow?.document.body as HTMLElement, ()=>{
				setTimeout(()=>{
					newWindow?.document.close();
					newWindow?.focus();
			
					newWindow?.print();
				}, 2000);
			})
		}
		
		/* let newFrameTitle = params.printTitle.raw?.toString() + "-" +(new Date()).toISOString()
		
		document?.querySelector('body')?.insertAdjacentHTML("beforeend",`<iframe id="printframe" style="display:none;" name='${newFrameTitle}'><</iframe>`);
		var printIframe= document.getElementById('printframe') as HTMLIFrameElement;
		var printIframeBody = printIframe.contentDocument?.querySelector('body') as HTMLBodyElement;
		// if(printIframeBody.innerText==""){
			printIframe.contentDocument?.querySelector('body')?.insertAdjacentHTML("beforeend",`${params.htmlContent.raw}`);
			let windowFrameToPrint = Array.from(window.frames).filter(frame => frame.name == newFrameTitle)[0];
			console.log(windowFrameToPrint)
			windowFrameToPrint.focus();
			windowFrameToPrint.print();
			let removeContent = window.setTimeout(()=>{
				Array.from(document?.querySelectorAll("#printframe")).forEach(elm => elm.parentNode?.removeChild(elm));
			}, 1000);
			window.clearTimeout(removeContent);
		// } */

		// newWindow?.close();

		this._notifyOutputChanged();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			download: false
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
	}

	public waitForImages(element:HTMLElement, callback:()=>void) {
		/* Function to check and with until all the images have been loaded before running the callback function */
		var allImgsLength = 0;
		var allImgsLoaded = 0;
		var allImgs: { src: string; element: HTMLImageElement; }[] = [];
	
		var filtered: HTMLImageElement[] = Array.prototype.filter.call(element.querySelectorAll('img'), function (item) {
			if (item.src === '') {
				return false;
			}
	
			// Firefox's `complete` property will always be `true` even if the image has not been downloaded.
			// Doing it this way works in Firefox.
			var img = new Image();
			img.src = item.src;
			return !img.complete;
		});
	
		filtered.forEach(function (item) {
			allImgs.push({
				src: item.src,
				element: item
			});
		});
	
		allImgsLength = allImgs.length;
		allImgsLoaded = 0;
	
		// If no images found, don't bother.
		if (allImgsLength === 0) {
			callback.call(element);
		}
	
		allImgs.forEach(function (img) {
			var image = new Image();
	
			// Handle the image loading and error with the same callback.
			image.addEventListener('load', function () {
				allImgsLoaded++;
	
				if (allImgsLoaded === allImgsLength) {
					callback.call(element);
					return false;
				}
			});
	
			image.src = img.src;
		});
	};
}