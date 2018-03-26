import Vue from 'vue2'
import Form from '@/modules/form'
import createVue from '../utils/create-vue'

describe('Form.vue', () => {
  let vm
  afterEach(() => {
    if (vm) {
      vm.$parent.destroy()
      vm = null
    }
  })
  it('use', () => {
    Vue.use(Form)
    expect(Vue.component(Form.name))
      .to.be.a('function')
    expect(Vue.component(Form.Group.name))
      .to.be.a('function')
    expect(Vue.component(Form.Item.name))
      .to.be.a('function')
  })

  it('should render correct contents', () => {
    vm = createForm({
      action: '/',
      model: {
        inputValue: ''
      },
      schema: {
        groups: [
          {
            legend: 'Legend',
            fields: [
              {
                type: 'input',
                model: 'inputValue',
                label: 'Input',
                props: {
                  placeholder: 'Please input'
                },
                rules: {
                  required: true
                }
              }
            ]
          },
          {
            fields: [
              {
                type: 'submit',
                label: 'Submit'
              }
            ]
          }
        ]
      }
    })

    expect(vm.fields.length)
      .to.equal(2)
    expect(vm.$el.className)
      .to.equal('cube-form cube-form_normal cube-form_groups')
    const groups = vm.$el.querySelectorAll('.cube-form-group')
    expect(groups.length)
      .to.equal(2)
    expect(groups[0].querySelector('.cube-form-group-legend').textContent.trim())
      .to.equal('Legend')
    expect(groups[0].querySelector('.cube-form-item').className)
      .to.include('cube-form-item_required')
    expect(groups[0].querySelector('.cube-validator'))
      .not.to.be.null
    expect(groups[1].querySelector('.cube-form-item').className)
      .to.include('cube-form-item_btn')
    expect(groups[1].querySelector('.cube-btn'))
      .not.to.be.null
  })

  it('should validate & reset correctly', (done) => {
    vm = createForm({
      action: '/',
      newModel: false,
      model: {
        inputValue: '',
        checkboxValue: false,
        switchValue: false,
        rateValue: 0
      },
      schema: {
        fields: [
          {
            type: 'input',
            model: 'inputValue',
            label: 'Input',
            props: {
              placeholder: 'Please input'
            },
            rules: {
              required: true
            }
          },
          {
            type: 'checkbox',
            model: 'checkboxValue',
            label: 'Checkbox',
            rules: {
              required: true
            }
          },
          {
            type: 'switch',
            model: 'switchValue',
            label: 'Switch',
            rules: {
              required: true
            }
          },
          {
            type: 'rate',
            model: 'rateValue',
            label: 'Rate',
            rules: {
              required: true
            }
          }
        ]
      }
    })
    setTimeout(() => {
      // should validated
      // corrent contents
      expect(vm.$el.className)
        .to.include('cube-form_invalid')
      expect(vm.$el.querySelector('.cube-form-item').className)
        .to.include('cube-form-item_invalid')
      expect(vm.$el.querySelector('.cube-validator').className)
        .to.include('cube-validator_invalid')
      expect(vm.$el.querySelector('.cube-validator-msg-def').textContent.trim())
        .to.equal('此为必填项')
      expect(vm.$el.querySelectorAll('.cube-form-item_invalid').length)
        .to.equal(4)
      // validity
      expect(vm.dirty)
        .to.be.false
      expect(vm.valid)
        .to.be.false
      expect(vm.invalid)
        .to.be.true
      expect(vm.firstInvalidFieldIndex)
        .to.equal(0)
      expect(vm.validity.inputValue.valid)
        .to.be.false
      expect(vm.validity.inputValue.result.required.invalid)
        .to.be.true

      // change switchValue model data
      vm.model.switchValue = true

      setTimeout(() => {
        expect(vm.validity.switchValue.valid)
          .to.be.true
        expect(vm.validity.switchValue.dirty)
          .to.be.true
        expect(vm.dirty)
          .to.be.true
        // reset
        vm.reset()
        expect(vm.dirty)
          .to.be.false
        expect(vm.validity.inputValue.valid)
          .to.be.undefined
        expect(vm.validity.switchValue.dirty)
          .to.be.false
        done()
      })
    })
  })

  it('should trigger events', (done) => {
    const submitHandler = sinon.spy()
    const resetHandler = sinon.spy()
    const validateHandler = sinon.spy()
    const validHandler = sinon.spy()
    const invalidHandler = sinon.spy()

    vm = createForm({
      action: '/',
      model: {
        inputValue: ''
      },
      schema: {
        fields: [
          {
            type: 'input',
            model: 'inputValue',
            label: 'Input',
            props: {
              placeholder: 'Please input'
            },
            rules: {
              required: true
            }
          },
          {
            type: 'submit',
            label: 'Submit'
          },
          {
            type: 'reset',
            label: 'Reset'
          }
        ]
      }
    }, {
      submit: function (e) {
        e.preventDefault()
        submitHandler.apply(this, arguments)
      },
      reset: resetHandler,
      validate: validateHandler,
      valid: validHandler,
      invalid: invalidHandler
    })
    // submit
    vm.$el.querySelector('.cube-btn').click()
    expect(invalidHandler)
      .to.be.calledOnce
    expect(invalidHandler)
      .to.be.calledWith(vm.validity)
    setTimeout(() => {
      expect(validateHandler)
        .to.be.calledOnce
      // reset
      vm.$el.querySelector('.cube-btn[type="reset"]').click()
      expect(resetHandler)
        .to.be.calledOnce
      setTimeout(() => {
        expect(validateHandler)
          .to.be.calledTwice
        vm.model.inputValue = '1'
        setTimeout(() => {
          // for model change
          expect(validateHandler)
            .to.be.calledThrice
          // submit again
          vm.$el.querySelector('.cube-btn').click()
          expect(validHandler)
            .to.be.calledOnce
          expect(validHandler)
            .to.be.calledWith(vm.validity)
          expect(submitHandler)
            .to.be.calledOnce
          setTimeout(() => {
            // submit validate
            expect(validateHandler)
              .to.have.callCount(4)
            done()
          })
        })
      })
    })
  })

  function createForm(props = {}, events = {}) {
    return createVue({
      template: '<cube-form v-bind="props" v-on="events" />',
      data: {
        props,
        events
      }
    })
  }
})
