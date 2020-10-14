module.exports = {
	name: "Send Message With Embed",
	section: "Embed Message",
	subtitle: function(data) {
		const channels = ["Same Channel", "Command Author", "Mentioned User", "Mentioned Channel", "Default Channel", "Temp Variable", "Server Variable", "Global Variable"];
		return `${channels[parseInt(data.channel)]}: ${data.varName} - "${data.message.replace(/[\n\r]+/, "")}"`;
	},
	fields: ["storage", "varName", "channel", "varName2", "storage3", "varName3","message"],
	variableStorage: function(data, varType) {
		const type = parseInt(data.storage3);
		if(type !== varType) return;
		return ([data.varName, "Message",]);
	},
	html: function(isEvent, data) {
		return `
<div>
	<div style="float: left; width: 35%;">
		Source Embed Object:<br>
		<select id="storage" class="round" onchange="glob.refreshVariableList(this)">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; width: 60%;">
		Variable Name:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px; float: left; width: 35%;">
	Send To:<br>
	<select id="channel" class="round" onchange="glob.sendTargetChange(this, 'varNameContainer2')">
		${data.sendTargets[isEvent ? 1 : 0]}
	</select>
</div>
<div id="varNameContainer2" style="display: none; float: right; width: 60%;">
	Variable Name:<br>
	<input id="varName2" class="round" type="text"><br>
</div><br><br><br><br>
<div style="padding-top: 8px;">
	Message:<br>
	<textarea id="message" rows="9" placeholder="Insert message here..." style="width: 99%; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
</div><br>
<div style="float: left; width: 35%;">
  Store Message Object in:<br>
    <select id="storage3" class="round" onchange="glob.variableChange(this, 'varNameContainer3')">
      ${data.variables[0]}
    </select>
</div>
<div id="varNameContainer3" style="display: none; float: right; width: 60%;">
  Storage Variable Name:<br>
  <input id="varName3" class="round" type="text">
</div><br><br><br>
<div>`;
	},
	init: function() {
		const { glob, document } = this;

		glob.refreshVariableList(document.getElementById("storage"));
		glob.sendTargetChange(document.getElementById("channel"), "varNameContainer2");
		glob.variableChange(document.getElementById("storage3"), "varNameContainer3");
	},
	action: function(cache) {
		const data = cache.actions[cache.index];
		const channel = parseInt(data.channel);		
		const storage = parseInt(data.storage);
		const message = data.message;
		if(channel === undefined || message === undefined) return;
		const varName = this.evalMessage(data.varName, cache);
		const embed = this.getVariable(storage, varName, cache);
		if(!embed) {
			this.callNextAction(cache);
			return;
		}
		const varName2 = this.evalMessage(data.varName2, cache);
		const varName3 = this.evalMessage(data.varName3, cache);
		const storage3 = parseInt(data.storage3);
		const target = this.getSendTarget(channel, varName2, cache);
		if(Array.isArray(target)) {
			this.callListFunc(target, "send", [this.evalMessage(message, cache), embed]).then(() => this.callNextAction(cache));
		} else if(target && target.send) {
			target.send(this.evalMessage(message, cache), embed)
				.then((msg) => {
					if(msg && varName3) this.storeValue(msg, storage3, varName3, storage, message, varName, cache);
					this.callNextAction(cache);
				})
				.catch(this.displayError.bind(this, data, cache));
		} else {
			this.callNextAction(cache);
		}
	},
	mod: function() {}
}; // End of module
