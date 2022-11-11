var SocraticTool = {};
SocraticTool.roles = ["Learner", "Student", "Test Learner", "Test Learner (C)"];
SocraticTool.toc = null;
SocraticTool.changed = false;
SocraticTool.response = null;

SocraticTool.init = function (data) {
  SocraticTool.enrollments = data;

  if ($("#questionTool").length > 0 || $(".questionReference").length > 0) {
    SocraticTool.buildReflection = true;

    // if ($('#questionTool').attr('data-reference') !== undefined) {
    //    SocraticTool.referenceID = $('#questionTool').attr('data-reference');
    // }

    libVal.get.toc(SocraticTool.ouID, SocraticTool.processTOC);
  } else if ($("#questionReport").length > 0) {
    SocraticTool.buildReport = true;

    if ($("#questionReport").attr("data-reference") !== undefined) {
      SocraticTool.reportTopics = $("#questionReport")
        .attr("data-reference")
        .replace(/\s*\|\s*/g, "|")
        .replace(/^\s*/g, "")
        .replace(/\s+$/g, "")
        .replace(/\s*\[/g, "[")
        .split("||");

      libVal.get.toc(SocraticTool.ouID, SocraticTool.processTOC);
      // libVal.get.folders(SocraticTool.ouID, {}, SocraticTool.processFolders);
    }
  }
};

SocraticTool.processTOC = function (data) {
  SocraticTool.topicList = [];
  SocraticTool.toc = data;
  SocraticTool.toc.activeCount = SocraticTool.toc.Modules.length;

  for (var i = 0; i < SocraticTool.toc.Modules.length; i++) {
    SocraticTool.collectTopics(SocraticTool.toc.Modules[i]);
  }
};

SocraticTool.collectTopics = function (mod) {
  for (var i = 0; i < mod.Topics.length; i++) {
    SocraticTool.topicList.push(mod.Topics[i]);
  }

  if (mod.Modules.length > 0) {
    SocraticTool.toc.activeCount += mod.Modules.length;

    for (var j = 0; j < mod.Modules.length; j++) {
      SocraticTool.collectTopics(mod.Modules[j]);
    }
  }

  SocraticTool.toc.activeCount--;

  if (SocraticTool.toc.activeCount === 0) {
    SocraticTool.startBuild();
  }
};

SocraticTool.startBuild = function () {
  var foundTopic = SocraticTool.topicList.find(
    (topic) => topic.Identifier === SocraticTool.topicID
  );
  var foundReference = false;

  if (foundTopic !== undefined) {
    SocraticTool.topicTitle = foundTopic.Title;
  }

  if (SocraticTool.buildReflection) {
    $.each($(".questionReference"), function () {
      var refTitle = $(this)
        .attr("data-topic")
        .replace(/^\s*/g, "")
        .replace(/\s+$/g, "");
      var refTopic = SocraticTool.topicList.find(
        (topic) =>
          topic.Title.replace(/^\s*/g, "").replace(/\s+$/g, "") === refTitle
      );

      if (refTopic !== undefined) {
        foundReference = true;
        $(this).attr("id", refTopic.Identifier);
        $(this).attr("data-title", refTitle);
      }
    });

    if (foundTopic !== undefined || foundReference === true) {
      libVal.get.folders(SocraticTool.ouID, {}, SocraticTool.processFolders);
    }
  } else if (SocraticTool.buildReport) {
    libVal.get.folders(SocraticTool.ouID, {}, SocraticTool.processFolders);
  }
};

SocraticTool.processFolders = function (data) {
  SocraticTool.folders = data;

  if (SocraticTool.buildReflection) {
    for (var i = 0; i < SocraticTool.folders.length; i++) {
      if (SocraticTool.topicTitle) {
        if (SocraticTool.folders[i].Name === SocraticTool.topicTitle) {
          SocraticTool.folderID = SocraticTool.folders[i].Id;
          SocraticTool.folder = SocraticTool.folders[i];

          if (
            SocraticTool.roles.indexOf(
              SocraticTool.enrollments.Access.ClasslistRoleName
            ) !== -1
          ) {
            libVal.get.submissions(
              SocraticTool.ouID,
              SocraticTool.folderID,
              {},
              SocraticTool.processSubmissions,
              { type: "topic" }
            );
          } else {
            SocraticTool.updateForm({ type: "topic" });
          }
        }
      }

      // if (SocraticTool.referenceID !== undefined) {
      //    if (SocraticTool.referenceTitle) {
      //       if (SocraticTool.folders[i].Name === SocraticTool.referenceTitle) {
      //          SocraticTool.referenceFolderID = SocraticTool.folders[i].Id;
      //          SocraticTool.referenceFolder = SocraticTool.folders[i];
      //          libVal.get.submissions(SocraticTool.ouID, SocraticTool.referenceFolderID, {}, SocraticTool.processSubmissions, {"type": "reference"});
      //       }
      //    }
      // }
      $.each($(".questionReference"), function () {
        if ($(this).attr("data-title") !== undefined) {
          if (SocraticTool.folders[i].Name === $(this).attr("data-title")) {
            libVal.get.submissions(
              SocraticTool.ouID,
              SocraticTool.folders[i].Id,
              {},
              SocraticTool.processSubmissions,
              {
                type: "reference",
                id: $(this).attr("id"),
                instructions: $(this).attr("data-instructions"),
                folder: SocraticTool.folders[i],
              }
            );
          }
        }
      });
    }
  } else if (SocraticTool.buildReport) {
    SocraticTool.updateReport();
  }
};

SocraticTool.processSubmissions = function (data, storage) {
  if (storage.type === "topic") {
    SocraticTool.submissions = data;
  } else {
    storage.submissions = data;
  }

  SocraticTool.updateForm(storage);
};

SocraticTool.updateForm = function (data) {
  if (data.type === "topic") {
    var instructions = $("<div>");
    var input = $(
      '<textarea id="text_input" class="width-100" style="min-height: 150px; width: 100%;">'
    );
    var unsaved = $('<p id="unsaved"><em>Unsubmitted response</em></p>');
    var save = $('<button id="save" class="btn btn-primary" disabled>');
    var restore = $('<button id="restore" class="btn btn-secondary">');
    var foundSubmission = false;

    instructions.html(SocraticTool.folder.CustomInstructions.Html);

    unsaved.hide();

    save.text("Submit");
    save.click(function () {
      $(this).attr("disabled", true);
      $(this).text("Submitting...");

      SocraticTool.response = $("#text_input").val().replace(/"/gi, '\\"');
      SocraticTool.saveResponse();
    });

    restore.text("Use Unsubmitted Response");
    restore.click(function () {
      save.attr("disabled", false);
      restore.hide();
      unsaved.show();
      input.val(localStorage["topic" + SocraticTool.topicID]);
    });

    if (
      SocraticTool.roles.indexOf(
        SocraticTool.enrollments.Access.ClasslistRoleName
      ) !== -1
    ) {
      if (SocraticTool.submissions.length > 0) {
        if (SocraticTool.submissions[0].Submissions[0].Comment.Text !== "") {
          foundSubmission = true;
          SocraticTool.response =
            SocraticTool.submissions[0].Submissions[0].Comment.Text;

          input.val(SocraticTool.submissions[0].Submissions[0].Comment.Text);
        }
      }

      if (foundSubmission === false) {
        if (
          $("#questionTool").attr("data-prepop") !== undefined &&
          $("#questionTool").attr("data-prepop") !== ""
        ) {
          input.val($("#questionTool").attr("data-prepop"));
        }
      }

      $("#questionTool").append(unsaved, save);

      if (localStorage["topic" + SocraticTool.topicID] !== undefined) {
        $("#questionTool").append(restore);
      }

      input.on("keyup", function (e) {
        if (SocraticTool.detectChanges() === true) {
          $("#save").attr("disabled", false);
          $("#unsaved").show();
        } else {
          $("#save").attr("disabled", true);
          $("#unsaved").hide();
        }
      });
    } else {
      save.attr("disabled", true);
      save.hide();

      input = $("<p>");
      input.text("[USER RESPONSE FIELD]");
    }

    $("#questionTool").prepend(instructions, input);

    $(window).on("beforeunload", SocraticTool.cacheResponse);
  }

  if (data.type === "reference") {
    var instructions = $("<div>");
    var response = $("<p>");

    if ($("#" + data.id).attr("data-instructions") === "true") {
      instructions.html(data.folder.CustomInstructions.Html);
    }

    response.html("<em>No response given.</em>");

    if (
      SocraticTool.roles.indexOf(
        SocraticTool.enrollments.Access.ClasslistRoleName
      ) !== -1
    ) {
      if (data.submissions.length > 0) {
        if (data.submissions[0].Submissions[0].Comment.Text !== "") {
          response.text(data.submissions[0].Submissions[0].Comment.Text);
        }
      }
    } else {
      response.text("[PREVIOUS USER RESPONSE]");
    }

    $("#" + data.id).append(instructions, response);
  }
};

SocraticTool.updateReport = function () {
  var reportContent = $('<div id="reportContent">');
  var download = $('<a id="download" class="btn btn-primary">');

  download.text("Download");
  download.click(function () {
    SocraticTool.saveReport();
  });

  $("#questionReport").append(reportContent);

  for (var i = 0; i < SocraticTool.reportTopics.length; i++) {
    if (SocraticTool.reportTopics[i].search(/\[[a-z0-9\s]*\]/gi) !== -1) {
      var refTitle = SocraticTool.reportTopics[i]
        .replace(/[a-z0-9\s]*\[/gi, "")
        .replace(/\][a-z0-9\s]*/gi, "");
      var refTopic = SocraticTool.getTopic(refTitle);

      if (refTopic !== null) {
        var reference = $("<p>");
        reference.html(
          "<em>(Please refer back to " + refTopic.Title + ")</em>"
        );
      }
    }

    var topic = SocraticTool.getTopic(
      SocraticTool.reportTopics[i].replace(/\[[a-z0-9\s]*\]/gi, "")
    );

    if (topic !== null) {
      var folder = SocraticTool.getFolder(topic.Title);
      var id = topic.Identifier;
      var heading = $('<h3 class="reportHeading">');
      var instructions = $("<p>");
      var divider = $("<hr>");
      var response = $("<div>");

      if (folder !== null) {
        heading.text(topic.Title);
        reportContent.append(heading);

        if (reference) {
          reportContent.append(reference);
        }

        instructions.html(folder.CustomInstructions.Html);
        response.attr("id", "response_" + id);
        reportContent.append(instructions, response);
      }

      if (
        SocraticTool.roles.indexOf(
          SocraticTool.enrollments.Access.ClasslistRoleName
        ) !== -1
      ) {
        libVal.get.submissions(
          SocraticTool.ouID,
          folder.Id,
          {},
          SocraticTool.addSubmission,
          { id: id }
        );
      } else {
        response.html("<br>[PREVIOUS USER RESPONSE]<br><br>");
      }
    }
  }

  $.each($(".reportHeading"), function (idx) {
    if (idx !== 0) {
      divider.clone().insertBefore($(this));
    }
  });

  if ($(".reportHeading").length > 0) {
    $("#questionReport").append(download);
  }
};

SocraticTool.addSubmission = function (data, storage) {
  var responseText = "<p><em>No response given.</em></p>";

  if (data.length > 0) {
    if (data[0].Submissions[0].Comment.Text !== "") {
      responseText = data[0].Submissions[0].Comment.Html;
    }
  }

  response = responseText.replace(/\n/g, "<br>");

  $("#response_" + storage.id).html(responseText);
  $("#response_" + storage.id).prepend($("<br>"));
  $("#response_" + storage.id).append($("<br><br>"));
};

SocraticTool.saveReport = function () {
  var header =
    "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    "xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>Reflection Report</title></head><body>";
  var footer = "</body></html>";
  var sourceHTML =
    header + document.getElementById("reportContent").innerHTML + footer;
  var source =
    "data:application/vnd.ms-word;charset=utf-8," +
    encodeURIComponent(sourceHTML);

  var fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download =
    "Reflection Report - " + new Date().getTime() + ".doc";
  fileDownload.click();
  document.body.removeChild(fileDownload);
};

SocraticTool.saveResponse = function () {
  var fileArray, blob;
  var template = templates.uploadDropbox;

  template = template
    .replace("fname", "null")
    .replace("ftype", "null")
    .replace("fdesc", SocraticTool.response);
  fileArray = template.split("~");
  fileArray[1] = SocraticTool.response;

  blob = new Blob(fileArray);

  libVal.post.mySubmissions(
    SocraticTool.ouID,
    SocraticTool.folderID,
    blob,
    SocraticTool.savedResponse
  );
};

SocraticTool.savedResponse = function (w) {
  // $('#save').attr('disabled', false);
  $("#save").text("Submit");

  $("#unsaved").hide();
  $("#restore").remove();

  delete localStorage["topic" + SocraticTool.topicID];
};

SocraticTool.getOrgId = function () {
  var pathname = window.top.location.pathname;
  var orgId = pathname.split("/")[4];

  return orgId;
};

SocraticTool.getTopicId = function () {
  var href = window.top.location.href;
  var topicId;

  if (href.indexOf("enhancedSequenceViewer") !== -1) {
    href = decodeURIComponent(href);
    href = href.split("?url=")[1];
    href = href.split("?")[0];

    topicId = href.split("/")[5];
  } else {
    topicId = href.split("/")[8];
  }

  return topicId;
};

SocraticTool.getTopic = function (topicTitle) {
  var topic = SocraticTool.topicList.find(
    (topic) =>
      topic.Title.replace(/^\s*/g, "").replace(/\s+$/g, "") === topicTitle
  );

  if (topic !== undefined) {
    return topic;
  }

  return null;
};

SocraticTool.getFolder = function (title) {
  for (var j = 0; j < SocraticTool.folders.length; j++) {
    if (SocraticTool.folders[j].Name.replace(/^\s+|\s+$/g, "") === title) {
      return SocraticTool.folders[j];
    }
  }

  return null;
};

SocraticTool.getSubmission = function (title) {
  for (var j = 0; j < SocraticTool.folders.length; j++) {
    if (SocraticTool.folders[j].Name === title) {
      return SocraticTool.folders[j];
    }
  }

  return null;
};

SocraticTool.detectChanges = function () {
  if (
    $("#text_input").val() !== SocraticTool.response &&
    $("#text_input").val() !== $("#questionTool").attr("data-prepop") &&
    $("#text_input").val() !== ""
  ) {
    return true;
  }

  return false;
};

SocraticTool.cacheResponse = function () {
  console.log("Caching...");

  if (SocraticTool.detectChanges() === true) {
    localStorage["topic" + SocraticTool.topicID] = $("#text_input").val();
  } else {
    delete localStorage["topic" + SocraticTool.topicID];
  }
};

$(document).ready(function () {
  SocraticTool.ouID = SocraticTool.getOrgId();
  SocraticTool.topicID = SocraticTool.getTopicId();

  libVal.get.myEnrollmentsOrg(SocraticTool.ouID, SocraticTool.init);
});
