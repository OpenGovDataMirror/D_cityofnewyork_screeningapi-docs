import responses from './responses.js';

export default function() {
  const errorMsg = 'Please enter your first name, last name, email and organization.';

  /**
  * Validate form fields
  * @param {object} formData - form fields
  * @param {object} event - event object
  */
  function validateFields(form, event) {
    event.preventDefault();

    const fields = form.serializeArray().reduce((obj, item) => (obj[item.name] = item.value, obj) ,{})
    const requiredFields = form.find('[required]');
    const emailRegex = new RegExp(/\S+@\S+\.\S+/);
    let hasErrors = false;

    // loop through each required field
    requiredFields.each(function() {
      const fieldName = $(this).attr('name');

      if( !fields[fieldName] ||
        (fieldName == 'EMAIL' && !emailRegex.test(fields.EMAIL)) ) {
        hasErrors = true;
        $(this).addClass('is-error');
        $(this).addClass('border-primary-red');
        $(this).before('<p class="is-error text-primary-red text-small my-0">'+ responses.find(x => x[fieldName])[fieldName] + '</p>');
      } else {
        $(this).removeClass('border-primary-red');
      }
    });

    // if there are no errors, submit
    if (hasErrors) {
      form.find('.form-error').html(`<p>${errorMsg}</p>`);
    } else {
      submitSignup(form, fields);
    }
  }

  /**
  * Submits the form object to Mailchimp
  * @param {object} formData - form fields
  */
  function submitSignup(form, formData){
    $.ajax({
      url: form.attr('action'),
      type: form.attr('method'),
      dataType: 'json',//no jsonp
      cache: false,
      data: formData,
      contentType: "application/json; charset=utf-8",
      success: function(response) {
        if(response.result !== 'success'){
            if(response.msg.includes('already subscribed')){
              form.html('<p class="text-primary-red text-center italic">'+ responses.find(x => x["ERR_ALREADY_REQUESTED"])["ERR_ALREADY_REQUESTED"] + '</p>');
            } else if(response.msg.includes('too many recent signup requests')){
              form.html('<p class="text-primary-red text-center italic">'+ responses.find(x => x["ERR_TOO_MANY_REQUESTS"])["ERR_TOO_MANY_REQUESTS"] +'</p>');
            } else if(response.msg.includes('captcha')){
              var url = $("form#mc-embedded-subscribe-form").attr("action");
              var parameters = $.param(response.params);
              url = url.split("-json?")[0];
              url += "?";
              url += parameters;
              window.open(url, '_blank');
              form.html('<p class="text-primary-navy text-center italic">'+ responses.find(x => x["MSG_RECAPTCHA"])["MSG_RECAPTCHA"] +'<a class="text-primary-red" target="_blank" href="' + url + '"> Please confirm that you are not a robot.</a></p>');
            }else {
              form.html('<p class="text-primary-red text-center italic">' + responses.find(x => x["ERR"])["ERR"] + '</p>');
            }
        }else {
          form.html('<p class="text-primary-navy text-center italic">'+ responses.find(x => x["SUCCESS"])["SUCCESS"] +'</p>');
        }
      },
      error: function(response) {
        console.log(response)
        form.before('<p class="text-primary-red text-center italic">' + responses.find(x => x["ERR"])["ERR"] + '</p>');
      }
    });
  }

  /**
  * Triggers form validation and sends the form data to Mailchimp
  * @param {object} formData - form fields
  */
  $('#mc-embedded-subscribe:button[type="submit"]').click(function(event){
    event.preventDefault();
    let $form = $(this).parents('form');
    validateFields($form, event);
  });

}
