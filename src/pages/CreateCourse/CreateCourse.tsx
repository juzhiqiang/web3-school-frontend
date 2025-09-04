            {/* 一灯币支付说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">关于一灯币支付</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    学员将使用一灯币(YD)购买您的课程。平台收取2.5%手续费，其余收益归您所有。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Star className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">详细介绍</h2>
              <p className="text-gray-600">使用富文本编辑器详细描述您的课程</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                课程详细描述 *
              </label>
              <RichTextEditor
                value={formData.detailedDescription}
                onChange={(value) => handleInputChange('detailedDescription', value)}
                placeholder="请详细描述课程内容、学习目标、适用人群、先修要求等..."
                className="min-h-[300px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                支持富文本格式，可以添加标题、列表、粗体、斜体等格式
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">课程章节</h2>
              <p className="text-gray-600">添加课程的具体章节和视频内容</p>
            </div>

            <LessonManager
              lessons={formData.lessons}
              onLessonsChange={(lessons) => handleInputChange('lessons', lessons)}
            />

            {formData.lessons.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">还没有添加章节</p>
                <p className="text-gray-400 text-sm">请添加至少一个章节来继续</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Eye className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">预览与确认</h2>
              <p className="text-gray-600">检查您的课程信息并确认发布</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-200">
                {thumbnail && (
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={thumbnail} 
                      alt={formData.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {formData.title}
                </h1>
                
                <p className="text-gray-600 mb-4">
                  {formData.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      {formatYiDengAmount(formData.price)} YD
                    </span>
                  </div>
                  
                  {formData.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formData.duration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>{formData.lessons.length} 章节</span>
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Revenue Breakdown */}
              <div className="px-6 py-4 bg-orange-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">收益分配</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">课程价格</p>
                    <p className="font-semibold text-lg text-orange-600">
                      {formatYiDengAmount(formData.price)} YD
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">平台手续费 (2.5%)</p>
                    <p className="font-semibold text-lg text-gray-500">
                      -{calculatePlatformFee(formData.price)} YD
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">您的收益</p>
                    <p className="font-semibold text-lg text-green-600">
                      {calculateCreatorRevenue(formData.price)} YD
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6 space-y-6">
                {/* Detailed Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">课程详情</h3>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.detailedDescription }}
                  />
                </div>

                {/* Lessons */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">课程章节</h3>
                  <div className="space-y-3">
                    {formData.lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <h4 className="font-medium">{lesson.title}</h4>
                            {lesson.duration && (
                              <span className="text-sm text-gray-500">
                                ({lesson.duration})
                              </span>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-8">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <React.Fragment key={stepNumber}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : isCompleted
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`h-0.5 w-12 transition-all ${
                  stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const stepTitles = [
    '基本信息',
    '详细描述', 
    '课程章节',
    '预览确认'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建新课程</h1>
        <p className="text-gray-600">
          步骤 {currentStep} / {totalSteps}: {stepTitles[currentStep - 1]}
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一步
            </button>

            <div className="flex space-x-3">
              {currentStep === totalSteps ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || !validateStep(currentStep)}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>创建中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>发布课程</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  下一步
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">进度摘要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className={`${formData.title ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 课程名称: {formData.title ? '已填写' : '待填写'}
          </div>
          <div className={`${formData.price && !priceError ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 价格设置: {formData.price && !priceError ? `${formatYiDengAmount(formData.price)} YD` : '待设置'}
          </div>
          <div className={`${formData.detailedDescription ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 详细描述: {formData.detailedDescription ? '已完成' : '待完成'}
          </div>
          <div className={`${formData.lessons.length > 0 ? 'text-green-700' : 'text-gray-500'}`}>
            ✓ 章节内容: {formData.lessons.length > 0 ? `${formData.lessons.length}个章节` : '待添加'}
          </div>
        </div>
      </div>

      {/* Token Balance Warning */}
      {ydBalance && parseFloat(ydBalance) === 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Wallet className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">一灯币余额不足</h4>
              <p className="text-sm text-yellow-700">
                您当前的一灯币余额为0。虽然创建课程免费，但学员需要一灯币来购买您的课程。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;
